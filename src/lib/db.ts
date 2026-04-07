import { supabase } from "./supabase";
import type { RideSlot, Booking, BookingFriend, Vehicle, User } from "./types";

// ---- RIDES ----

export async function getRides(): Promise<RideSlot[]> {
  const { data, error } = await supabase
    .from("ride_slots")
    .select(`
      *,
      vehicle:vehicles(*),
      driver:users!ride_slots_driver_id_fkey(id, name, email, phone, photo_url)
    `)
    .in("status", ["open", "full"])
    .order("departure_time", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getRideById(id: string): Promise<RideSlot | null> {
  const { data, error } = await supabase
    .from("ride_slots")
    .select(`
      *,
      vehicle:vehicles(*),
      driver:users!ride_slots_driver_id_fkey(id, name, email, phone, photo_url)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// ---- BOOKINGS ----

export async function createBooking(params: {
  userId: string;
  rideSlotId: string;
  numPassengers: number;
  totalPriceCents: number;
  riderName: string;
  riderEmail: string;
  riderPhone: string;
  friends: { name: string; email?: string; phone?: string }[];
}): Promise<Booking> {
  // Atomically book the seats
  const { data: seatsOk, error: seatsError } = await supabase.rpc("book_seats", {
    p_ride_slot_id: params.rideSlotId,
    p_num_passengers: params.numPassengers,
  });

  if (seatsError) throw new Error(seatsError.message);
  if (!seatsOk) throw new Error("Not enough seats available");

  // Create the booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: params.userId,
      ride_slot_id: params.rideSlotId,
      num_passengers: params.numPassengers,
      total_price_cents: params.totalPriceCents,
      rider_name: params.riderName,
      rider_email: params.riderEmail,
      rider_phone: params.riderPhone,
      status: "confirmed",
    })
    .select()
    .single();

  if (bookingError) {
    // Release the seats if booking insert fails
    await supabase.rpc("release_seats", {
      p_ride_slot_id: params.rideSlotId,
      p_num_passengers: params.numPassengers,
    });
    throw new Error(bookingError.message);
  }

  // Add friends if any
  if (params.friends.length > 0) {
    const friendRows = params.friends
      .filter((f) => f.name.trim())
      .map((f) => ({
        booking_id: booking.id,
        name: f.name,
        email: f.email || null,
        phone: f.phone || null,
      }));

    if (friendRows.length > 0) {
      await supabase.from("booking_friends").insert(friendRows);
    }
  }

  return booking;
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      ride_slot:ride_slots(
        *,
        vehicle:vehicles(*),
        driver:users!ride_slots_driver_id_fkey(id, name, phone, photo_url)
      ),
      friends:booking_friends(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getFriendBookings(email: string): Promise<Booking[]> {
  // Get booking IDs where this email is listed as a friend
  const { data: friendEntries, error: friendError } = await supabase
    .from("booking_friends")
    .select("booking_id")
    .eq("email", email);

  if (friendError || !friendEntries?.length) return [];

  const bookingIds = friendEntries.map((f) => f.booking_id);

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      *,
      ride_slot:ride_slots(
        *,
        vehicle:vehicles(*),
        driver:users!ride_slots_driver_id_fkey(id, name, phone, photo_url)
      ),
      friends:booking_friends(*)
    `)
    .in("id", bookingIds)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function cancelBooking(bookingId: string, userId: string): Promise<void> {
  // Get the booking first
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !booking) throw new Error("Booking not found");
  if (booking.status !== "confirmed") throw new Error("Booking is not active");

  // Cancel the booking
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (updateError) throw new Error(updateError.message);

  // Release the seats
  await supabase.rpc("release_seats", {
    p_ride_slot_id: booking.ride_slot_id,
    p_num_passengers: booking.num_passengers,
  });
}

export async function addFriendToBooking(bookingId: string, friend: { name: string; email?: string; phone?: string }): Promise<BookingFriend> {
  const { data, error } = await supabase
    .from("booking_friends")
    .insert({
      booking_id: bookingId,
      name: friend.name,
      email: friend.email || null,
      phone: friend.phone || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function removeFriendFromBooking(friendId: string): Promise<void> {
  const { error } = await supabase
    .from("booking_friends")
    .delete()
    .eq("id", friendId);

  if (error) throw new Error(error.message);
}

export async function getUserByAuthId(authId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", authId)
    .single();

  if (error) return null;
  return data;
}
