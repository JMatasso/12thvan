export type UserRole = "rider" | "driver" | "admin";
export type Direction = "to_snook" | "to_cstat";
export type RideStatus = "open" | "full" | "departed" | "completed" | "cancelled";
export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  type: "car" | "truck" | "van";
  capacity: number;
  description: string;
}

export interface RideSlot {
  id: string;
  vehicle_id: string;
  driver_id: string;
  direction: Direction;
  departure_time: string;
  pickup_location: string;
  dropoff_location: string;
  capacity: number;
  booked_count: number;
  price_cents: number;
  status: RideStatus;
  driver?: User;
  vehicle?: Vehicle;
}

export interface Booking {
  id: string;
  user_id: string;
  ride_slot_id: string;
  num_passengers: number;
  status: BookingStatus;
  total_price_cents: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
  rider_name?: string;
  rider_phone?: string;
  rider_email?: string;
  rider?: User;
  ride_slot?: RideSlot;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount_cents: number;
  stripe_id: string;
  status: PaymentStatus;
  refund_cents: number;
  created_at: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  num_passengers: number;
  agreed_to_waiver: boolean;
}
