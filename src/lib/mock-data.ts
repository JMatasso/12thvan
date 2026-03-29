import type { RideSlot, Booking, User, Vehicle } from "./types";

export const mockDrivers: User[] = [
  {
    id: "d1",
    name: "Jake Morrison",
    email: "jake@12thvan.com",
    phone: "9795551234",
    role: "driver",
    stripe_customer_id: null,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "d2",
    name: "Sarah Chen",
    email: "sarah@12thvan.com",
    phone: "9795555678",
    role: "driver",
    stripe_customer_id: null,
    created_at: "2026-03-01T00:00:00Z",
  },
];

export const mockVehicles: Vehicle[] = [
  { id: "v1", driver_id: "d1", type: "truck", capacity: 5, description: "Silver F-150 Crew Cab" },
  { id: "v2", driver_id: "d2", type: "van", capacity: 12, description: "White 15-Passenger Van" },
  { id: "v3", driver_id: "d1", type: "car", capacity: 4, description: "Black Tahoe" },
];

export const mockRideSlots: RideSlot[] = [
  // Friday to Snook
  {
    id: "rs1", vehicle_id: "v1", driver_id: "d1", direction: "to_snook",
    departure_time: "2026-04-10T14:00:00Z", pickup_location: "Post Oak Mall — 1500 Harvey Rd",
    dropoff_location: "Chilifest Grounds — FM 3058, Snook",
    capacity: 5, booked_count: 1, price_cents: 3000, status: "open",
  },
  {
    id: "rs2", vehicle_id: "v2", driver_id: "d2", direction: "to_snook",
    departure_time: "2026-04-10T15:00:00Z", pickup_location: "Post Oak Mall — 1500 Harvey Rd",
    dropoff_location: "Chilifest Grounds — FM 3058, Snook",
    capacity: 12, booked_count: 8, price_cents: 3000, status: "open",
  },
  {
    id: "rs3", vehicle_id: "v3", driver_id: "d1", direction: "to_snook",
    departure_time: "2026-04-10T16:00:00Z", pickup_location: "Post Oak Mall — 1500 Harvey Rd",
    dropoff_location: "Chilifest Grounds — FM 3058, Snook",
    capacity: 4, booked_count: 4, price_cents: 3000, status: "full",
  },
  {
    id: "rs4", vehicle_id: "v1", driver_id: "d1", direction: "to_snook",
    departure_time: "2026-04-10T18:00:00Z", pickup_location: "Post Oak Mall — 1500 Harvey Rd",
    dropoff_location: "Chilifest Grounds — FM 3058, Snook",
    capacity: 5, booked_count: 0, price_cents: 3000, status: "open",
  },
  // Friday back to CSTAT
  {
    id: "rs5", vehicle_id: "v2", driver_id: "d2", direction: "to_cstat",
    departure_time: "2026-04-10T23:00:00Z", pickup_location: "Chilifest Grounds — FM 3058, Snook",
    dropoff_location: "Post Oak Mall — 1500 Harvey Rd",
    capacity: 12, booked_count: 3, price_cents: 3000, status: "open",
  },
  {
    id: "rs6", vehicle_id: "v1", driver_id: "d1", direction: "to_cstat",
    departure_time: "2026-04-11T00:00:00Z", pickup_location: "Chilifest Grounds — FM 3058, Snook",
    dropoff_location: "Post Oak Mall — 1500 Harvey Rd",
    capacity: 5, booked_count: 2, price_cents: 3000, status: "open",
  },
  // Saturday to Snook
  {
    id: "rs7", vehicle_id: "v2", driver_id: "d2", direction: "to_snook",
    departure_time: "2026-04-11T11:00:00Z", pickup_location: "Post Oak Mall — 1500 Harvey Rd",
    dropoff_location: "Chilifest Grounds — FM 3058, Snook",
    capacity: 12, booked_count: 0, price_cents: 3000, status: "open",
  },
  {
    id: "rs8", vehicle_id: "v1", driver_id: "d1", direction: "to_snook",
    departure_time: "2026-04-11T13:00:00Z", pickup_location: "Post Oak Mall — 1500 Harvey Rd",
    dropoff_location: "Chilifest Grounds — FM 3058, Snook",
    capacity: 5, booked_count: 3, price_cents: 3000, status: "open",
  },
  // Saturday back to CSTAT
  {
    id: "rs9", vehicle_id: "v2", driver_id: "d2", direction: "to_cstat",
    departure_time: "2026-04-11T22:00:00Z", pickup_location: "Chilifest Grounds — FM 3058, Snook",
    dropoff_location: "Post Oak Mall — 1500 Harvey Rd",
    capacity: 12, booked_count: 5, price_cents: 3000, status: "open",
  },
  {
    id: "rs10", vehicle_id: "v1", driver_id: "d1", direction: "to_cstat",
    departure_time: "2026-04-12T00:30:00Z", pickup_location: "Chilifest Grounds — FM 3058, Snook",
    dropoff_location: "Post Oak Mall — 1500 Harvey Rd",
    capacity: 5, booked_count: 0, price_cents: 3000, status: "open",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "b1", user_id: "u1", ride_slot_id: "rs1", num_passengers: 1,
    status: "confirmed", total_price_cents: 3000,
    stripe_payment_intent_id: "pi_mock_1", created_at: "2026-03-20T10:00:00Z",
  },
  {
    id: "b2", user_id: "u2", ride_slot_id: "rs2", num_passengers: 3,
    status: "confirmed", total_price_cents: 9000,
    stripe_payment_intent_id: "pi_mock_2", created_at: "2026-03-21T14:00:00Z",
  },
  {
    id: "b3", user_id: "u3", ride_slot_id: "rs2", num_passengers: 5,
    status: "confirmed", total_price_cents: 15000,
    stripe_payment_intent_id: "pi_mock_3", created_at: "2026-03-22T09:00:00Z",
  },
];
