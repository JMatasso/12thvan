import { z } from "zod";

const friendSchema = z.object({
  name: z.string().min(1, "Friend name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  num_passengers: z.number().int().min(1).max(12),
  ride_slot_id: z.string().uuid(),
  agreed_to_waiver: z.literal(true, {
    message: "You must agree to the liability waiver",
  }),
  friends: z.array(friendSchema).default([]),
});

export const rideSlotSchema = z.object({
  vehicle_id: z.string().uuid(),
  driver_id: z.string().uuid(),
  direction: z.enum(["to_snook", "to_cstat"]),
  departure_time: z.string().datetime(),
  pickup_location: z.string().min(1),
  dropoff_location: z.string().min(1),
  capacity: z.number().int().min(1).max(15),
  price_cents: z.number().int().min(0),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type RideSlotInput = z.infer<typeof rideSlotSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
