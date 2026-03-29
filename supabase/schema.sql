-- 12th Van — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'rider' CHECK (role IN ('rider', 'driver', 'admin')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('car', 'truck', 'van')),
  capacity INTEGER NOT NULL CHECK (capacity >= 1 AND capacity <= 15),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);

-- ============================================================
-- RIDE SLOTS
-- ============================================================
CREATE TABLE ride_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('to_snook', 'to_cstat')),
  departure_time TIMESTAMPTZ NOT NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity >= 1),
  booked_count INTEGER NOT NULL DEFAULT 0,
  price_cents INTEGER NOT NULL DEFAULT 3000,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'departed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent overbooking at the database level
  CONSTRAINT no_overbooking CHECK (booked_count <= capacity)
);

CREATE INDEX idx_ride_slots_departure ON ride_slots(departure_time, status);
CREATE INDEX idx_ride_slots_driver ON ride_slots(driver_id);
CREATE INDEX idx_ride_slots_direction ON ride_slots(direction);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ride_slot_id UUID NOT NULL REFERENCES ride_slots(id) ON DELETE CASCADE,
  num_passengers INTEGER NOT NULL CHECK (num_passengers >= 1),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  total_price_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

CREATE INDEX idx_bookings_user ON bookings(user_id, status);
CREATE INDEX idx_bookings_ride_slot ON bookings(ride_slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  stripe_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  refund_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Atomically book seats (prevents race conditions)
CREATE OR REPLACE FUNCTION book_seats(
  p_ride_slot_id UUID,
  p_num_passengers INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  -- Lock the row to prevent concurrent modifications
  SELECT (capacity - booked_count) INTO v_remaining
  FROM ride_slots
  WHERE id = p_ride_slot_id
  FOR UPDATE;

  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'Ride slot not found';
  END IF;

  IF v_remaining < p_num_passengers THEN
    RETURN FALSE;
  END IF;

  UPDATE ride_slots
  SET
    booked_count = booked_count + p_num_passengers,
    status = CASE
      WHEN (booked_count + p_num_passengers) >= capacity THEN 'full'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_ride_slot_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Release seats (for cancellations)
CREATE OR REPLACE FUNCTION release_seats(
  p_ride_slot_id UUID,
  p_num_passengers INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE ride_slots
  SET
    booked_count = GREATEST(0, booked_count - p_num_passengers),
    status = CASE
      WHEN status = 'full' THEN 'open'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_ride_slot_id;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_ride_slots_updated_at
  BEFORE UPDATE ON ride_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public can read ride slots (for the booking page)
CREATE POLICY "Anyone can view open ride slots"
  ON ride_slots FOR SELECT
  USING (status IN ('open', 'full'));

-- Authenticated users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins have full access to users"
  ON users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins have full access to ride_slots"
  ON ride_slots FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins have full access to bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins have full access to payments"
  ON payments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Drivers can view their assigned rides
CREATE POLICY "Drivers can view own rides"
  ON ride_slots FOR SELECT
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can update own ride status"
  ON ride_slots FOR UPDATE
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

-- ============================================================
-- SEED DATA (for demo)
-- ============================================================
-- Uncomment and run after creating auth users to seed initial data

-- INSERT INTO users (id, name, email, phone, role) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Admin', 'admin@12thvan.com', '9795551111', 'admin'),
--   ('00000000-0000-0000-0000-000000000002', 'Jake Morrison', 'jake@12thvan.com', '9795551234', 'driver'),
--   ('00000000-0000-0000-0000-000000000003', 'Sarah Chen', 'sarah@12thvan.com', '9795555678', 'driver');

-- INSERT INTO vehicles (driver_id, type, capacity, description) VALUES
--   ('00000000-0000-0000-0000-000000000002', 'truck', 5, 'Silver F-150 Crew Cab'),
--   ('00000000-0000-0000-0000-000000000003', 'van', 12, 'White 15-Passenger Van'),
--   ('00000000-0000-0000-0000-000000000002', 'car', 4, 'Black Tahoe');
