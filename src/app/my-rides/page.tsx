"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, ArrowRight, Users, X, UserPlus, Banknote } from "lucide-react";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import type { Booking, BookingFriend } from "@/lib/types";

export default function MyRidesPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [friendBookings, setFriendBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [addingFriend, setAddingFriend] = useState<string | null>(null);
  const [newFriend, setNewFriend] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchBookings() {
      if (!user) return;
      try {
        // Fetch user's own bookings
        const { data: own, error: ownError } = await supabase
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
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!ownError && own) setBookings(own);

        // Fetch bookings where user is listed as a friend
        const { data: friendEntries } = await supabase
          .from("booking_friends")
          .select("booking_id")
          .eq("email", user.email);

        if (friendEntries?.length) {
          const bookingIds = friendEntries.map((f) => f.booking_id);
          const { data: fBookings } = await supabase
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

          if (fBookings) setFriendBookings(fBookings);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user]);

  async function handleCancel(bookingId: string, rideSlotId: string, numPassengers: number) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(bookingId);

    try {
      await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", bookingId);

      await supabase.rpc("release_seats", {
        p_ride_slot_id: rideSlotId,
        p_num_passengers: numPassengers,
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      );
    } catch {
      alert("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  }

  async function handleAddFriend(bookingId: string) {
    if (!newFriend.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from("booking_friends")
        .insert({
          booking_id: bookingId,
          name: newFriend.name,
          email: newFriend.email || null,
          phone: newFriend.phone || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId) {
            return { ...b, friends: [...(b.friends || []), data as BookingFriend] };
          }
          return b;
        })
      );

      setNewFriend({ name: "", email: "", phone: "" });
      setAddingFriend(null);
    } catch {
      alert("Failed to add friend");
    }
  }

  async function handleRemoveFriend(bookingId: string, friendId: string) {
    try {
      await supabase.from("booking_friends").delete().eq("id", friendId);

      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId) {
            return { ...b, friends: (b.friends || []).filter((f) => f.id !== friendId) };
          }
          return b;
        })
      );
    } catch {
      alert("Failed to remove friend");
    }
  }

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center pt-24 pb-16">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center pt-24 pb-16 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Sign in to view your rides</h1>
            <p className="mt-2 text-muted-foreground">
              Create an account or log in to see your bookings.
            </p>
            <Link href="/login">
              <Button className="mt-4">Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  function renderBookingCard(booking: Booking, isFriendBooking: boolean = false) {
    return (
      <Card key={booking.id} className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon text-white text-xs font-bold">
              {booking.ride_slot?.direction === "to_snook" ? "→S" : "→CS"}
            </div>
            <div>
              <p className="font-bold text-foreground">
                {booking.ride_slot?.direction === "to_snook"
                  ? "To Chilifest"
                  : "To College Station"}
              </p>
              <p className="text-sm text-muted-foreground">
                {booking.num_passengers} passenger{booking.num_passengers > 1 ? "s" : ""}
                {isFriendBooking && " (you're a friend on this ride)"}
              </p>
            </div>
          </div>
          <Badge
            variant={
              booking.status === "confirmed"
                ? "success"
                : booking.status === "cancelled"
                ? "danger"
                : "muted"
            }
          >
            {booking.status}
          </Badge>
        </div>

        {booking.ride_slot && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(booking.ride_slot.departure_time)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(booking.ride_slot.departure_time)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {booking.ride_slot.pickup_location}
            </span>
          </div>
        )}

        {/* Friends list */}
        {booking.friends && booking.friends.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> Friends on this ride
            </p>
            <div className="flex flex-wrap gap-2">
              {booking.friends.map((friend) => (
                <span
                  key={friend.id}
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                >
                  {friend.name}
                  {!isFriendBooking && booking.status === "confirmed" && (
                    <button
                      onClick={() => handleRemoveFriend(booking.id, friend.id)}
                      className="text-muted-foreground hover:text-foreground ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add friend button */}
        {!isFriendBooking && booking.status === "confirmed" && (
          <div className="mt-3">
            {addingFriend === booking.id ? (
              <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
                <Input
                  id="friend-name"
                  label="Friend Name"
                  placeholder="Friend's name"
                  value={newFriend.name}
                  onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id="friend-email"
                    label="Email (optional)"
                    placeholder="friend@tamu.edu"
                    value={newFriend.email}
                    onChange={(e) => setNewFriend({ ...newFriend, email: e.target.value })}
                  />
                  <Input
                    id="friend-phone"
                    label="Phone (optional)"
                    placeholder="(979) 555-0000"
                    value={newFriend.phone}
                    onChange={(e) => setNewFriend({ ...newFriend, phone: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAddFriend(booking.id)}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { setAddingFriend(null); setNewFriend({ name: "", email: "", phone: "" }); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setAddingFriend(booking.id)}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Add Friend
              </Button>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">
              {formatCents(booking.total_price_cents)}
            </span>
            {booking.status === "confirmed" && !booking.payment_collected && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                <Banknote className="h-3 w-3" />
                Pay at pickup
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Booked {formatDate(booking.created_at)}
            </span>
            {!isFriendBooking && booking.status === "confirmed" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCancel(booking.id, booking.ride_slot_id, booking.num_passengers)}
                disabled={cancelling === booking.id}
                className="text-danger hover:text-danger"
              >
                {cancelling === booking.id ? "Cancelling..." : "Cancel"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Rides</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome, {user.name}
              </p>
            </div>
            <Link href="/book">
              <Button size="sm">
                Book a Ride
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Own bookings */}
          <div className="mt-8 flex flex-col gap-4">
            {bookings.length === 0 && friendBookings.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">No rides booked yet.</p>
                <Link href="/book">
                  <Button className="mt-4">Book Your First Ride</Button>
                </Link>
              </div>
            ) : (
              <>
                {bookings.map((booking) => renderBookingCard(booking))}

                {/* Friend bookings */}
                {friendBookings.length > 0 && (
                  <>
                    <h2 className="mt-6 text-lg font-semibold text-foreground">
                      Rides You&apos;re On (added as a friend)
                    </h2>
                    {friendBookings.map((booking) => renderBookingCard(booking, true))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
