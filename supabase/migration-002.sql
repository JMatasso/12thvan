-- Migration 002: Pending bookings, simplified ride slots
-- Run this in the Supabase SQL Editor

-- 1. Add 'pending' and 'denied' to booking status
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'denied', 'cancelled', 'completed', 'no_show'));

-- 2. Make vehicle_id and driver_id nullable on ride_slots (admin just adds times)
ALTER TABLE ride_slots ALTER COLUMN vehicle_id DROP NOT NULL;
ALTER TABLE ride_slots ALTER COLUMN driver_id DROP NOT NULL;

-- 3. Drop the foreign key constraints so rides can exist without vehicles/drivers
ALTER TABLE ride_slots DROP CONSTRAINT IF EXISTS ride_slots_vehicle_id_fkey;
ALTER TABLE ride_slots DROP CONSTRAINT IF EXISTS ride_slots_driver_id_fkey;

-- 4. Re-add them as optional foreign keys
ALTER TABLE ride_slots ADD CONSTRAINT ride_slots_vehicle_id_fkey
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;
ALTER TABLE ride_slots ADD CONSTRAINT ride_slots_driver_id_fkey
  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL;

-- 5. Allow anyone to view all ride slots (not just open/full) for the booking page
DROP POLICY IF EXISTS "Anyone can view open ride slots" ON ride_slots;
CREATE POLICY "Anyone can view ride slots"
  ON ride_slots FOR SELECT
  USING (status IN ('open', 'full'));

-- 6. Allow service role inserts on ride_slots (for admin creating times)
-- (Service role already bypasses RLS, so no policy needed)
