export type UserRole = "rider" | "driver" | "admin";
export type Direction = "to_snook" | "to_cstat";
export type RideStatus = "open" | "full" | "departed" | "completed" | "cancelled";
export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";

export interface User {
  id: string;
  auth_id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  photo_url?: string;
  bio?: string;
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
  rider_name: string;
  rider_email: string;
  rider_phone: string;
  payment_collected: boolean;
  created_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  rider?: User;
  ride_slot?: RideSlot;
  friends?: BookingFriend[];
}

export interface BookingFriend {
  id: string;
  booking_id: string;
  name: string;
  email?: string;
  phone?: string;
  created_at?: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  num_passengers: number;
  agreed_to_waiver: boolean;
  friends: { name: string; email?: string; phone?: string }[];
}
