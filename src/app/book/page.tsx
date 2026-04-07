"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { RideSlotCard } from "@/components/booking/ride-slot-card";
import { BookingForm } from "@/components/booking/booking-form";
import { Button } from "@/components/ui/button";
import { cn, formatDate, formatTime, formatCents } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { Calendar, Clock, MapPin, Users, Banknote, CheckCircle } from "lucide-react";
import type { RideSlot, BookingFormData, Booking } from "@/lib/types";

type DayFilter = "all" | "friday" | "saturday";
type DirFilter = "all" | "to_snook" | "to_cstat";

export default function BookPage() {
  const { user, loading: authLoading } = useAuth();
  const [rides, setRides] = useState<RideSlot[]>([]);
  const [loadingRides, setLoadingRides] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<RideSlot | null>(null);
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [dirFilter, setDirFilter] = useState<DirFilter>("all");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    async function fetchRides() {
      try {
        const res = await fetch("/api/rides");
        const data = await res.json();
        setRides(data.rides || []);
      } catch {
        console.error("Failed to fetch rides");
      } finally {
        setLoadingRides(false);
      }
    }
    fetchRides();
  }, []);

  const filteredSlots = useMemo(() => {
    return rides.filter((slot) => {
      if (dayFilter === "friday" && !slot.departure_time.includes("04-10"))
        return false;
      if (dayFilter === "saturday" && !slot.departure_time.includes("04-11") && !slot.departure_time.includes("04-12"))
        return false;
      if (dirFilter !== "all" && slot.direction !== dirFilter) return false;
      return true;
    });
  }, [rides, dayFilter, dirFilter]);

  async function handleBookingSubmit(data: BookingFormData) {
    setSubmitting(true);
    setBookingError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          ride_slot_id: selectedSlot?.id,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        setBookingError(result.error || "Booking failed. Please try again.");
        return;
      }

      setConfirmedBooking(result.booking || null);
    } catch {
      setBookingError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Confirmation screen
  if (confirmedBooking) {
    const slot = confirmedBooking.ride_slot || selectedSlot;
    const friends = confirmedBooking.friends || [];

    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center pt-24 pb-16 px-4">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h1 className="mt-6 text-2xl font-bold">Booking Confirmed!</h1>
              <p className="mt-2 text-muted-foreground">
                Your ride is reserved. You can view this anytime in My Rides.
              </p>
            </div>

            {/* Ride details */}
            {slot && (
              <div className="mt-6 rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon text-white text-xs font-bold">
                    {slot.direction === "to_snook" ? "→S" : "→CS"}
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {slot.direction === "to_snook" ? "To Chilifest" : "To College Station"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {confirmedBooking.num_passengers} passenger{confirmedBooking.num_passengers > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{formatDate(slot.departure_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{formatTime(slot.departure_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>Pickup: {slot.pickup_location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>Drop-off: {slot.dropoff_location}</span>
                  </div>
                  {friends.length > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span>Friends: {friends.map((f) => f.name).join(", ")}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-2xl font-black">{formatCents(confirmedBooking.total_price_cents)}</span>
                  <span className="text-xs text-muted-foreground">Booking #{confirmedBooking.id.slice(0, 8)}</span>
                </div>
              </div>
            )}

            {/* Payment reminder */}
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <Banknote className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Pay in person at pickup</p>
                <p className="text-xs text-amber-700 mt-1">
                  Bring cash or tap-to-pay. Your driver will collect payment when you arrive.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => {
                setConfirmedBooking(null);
                setSelectedSlot(null);
              }}>
                Book Another Ride
              </Button>
              <Link href="/my-rides" className="flex-1">
                <Button className="w-full">My Rides</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Sign-in required
  if (!authLoading && !user) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center pt-24 pb-16 px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-maroon text-white font-black text-lg">
              12
            </div>
            <h1 className="mt-6 text-2xl font-bold">Sign in to book a ride</h1>
            <p className="mt-3 text-muted-foreground">
              Create an account or log in to reserve your seat to Chilifest.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link href="/login">
                <Button>Sign In / Create Account</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (selectedSlot) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center pt-24 pb-16 px-4">
          <div className="w-full max-w-lg">
            {bookingError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {bookingError}
              </div>
            )}
            <BookingForm
              slot={selectedSlot}
              onSubmit={handleBookingSubmit}
              onCancel={() => { setSelectedSlot(null); setBookingError(""); }}
              loading={submitting}
              defaultName={user?.name}
              defaultEmail={user?.email}
              defaultPhone={user?.phone}
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold text-foreground">Book a Ride</h1>
          <p className="mt-2 text-muted-foreground">
            Choose your ride to or from Chilifest 2026.
          </p>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {(["all", "friday", "saturday"] as DayFilter[]).map((day) => (
                <button
                  key={day}
                  onClick={() => setDayFilter(day)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    dayFilter === day
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {day === "all" ? "All Days" : day === "friday" ? "Fri Apr 10" : "Sat Apr 11"}
                </button>
              ))}
            </div>

            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {(
                [
                  { value: "all", label: "Both Directions" },
                  { value: "to_snook", label: "→ Chilifest" },
                  { value: "to_cstat", label: "→ College Station" },
                ] as { value: DirFilter; label: string }[]
              ).map((dir) => (
                <button
                  key={dir.value}
                  onClick={() => setDirFilter(dir.value)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    dirFilter === dir.value
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ride slots */}
          <div className="mt-6 flex flex-col gap-4">
            {loadingRides || authLoading ? (
              <div className="py-16 text-center text-muted-foreground">
                Loading available rides...
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                No rides match your filters. Try a different day or direction.
              </div>
            ) : (
              filteredSlots.map((slot) => (
                <RideSlotCard
                  key={slot.id}
                  slot={slot}
                  onSelect={setSelectedSlot}
                />
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
