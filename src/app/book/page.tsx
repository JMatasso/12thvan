"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { RideSlotCard } from "@/components/booking/ride-slot-card";
import { BookingForm } from "@/components/booking/booking-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mockRideSlots, mockVehicles } from "@/lib/mock-data";
import type { RideSlot, BookingFormData } from "@/lib/types";

type DayFilter = "all" | "friday" | "saturday";
type DirFilter = "all" | "to_snook" | "to_cstat";

export default function BookPage() {
  const [selectedSlot, setSelectedSlot] = useState<RideSlot | null>(null);
  const [dayFilter, setDayFilter] = useState<DayFilter>("all");
  const [dirFilter, setDirFilter] = useState<DirFilter>("all");
  const [bookingComplete, setBookingComplete] = useState(false);

  // Enrich slots with vehicle info
  const enrichedSlots = useMemo(
    () =>
      mockRideSlots.map((slot) => ({
        ...slot,
        vehicle: mockVehicles.find((v) => v.id === slot.vehicle_id),
      })),
    []
  );

  const filteredSlots = useMemo(() => {
    return enrichedSlots.filter((slot) => {
      if (dayFilter === "friday" && !slot.departure_time.includes("04-10"))
        return false;
      if (dayFilter === "saturday" && !slot.departure_time.includes("04-11") && !slot.departure_time.includes("04-12"))
        return false;
      if (dirFilter !== "all" && slot.direction !== dirFilter) return false;
      return true;
    });
  }, [enrichedSlots, dayFilter, dirFilter]);

  async function handleBookingSubmit(data: BookingFormData) {
    // In production, this calls /api/bookings which creates a Stripe checkout session
    console.log("Booking submitted:", { slot: selectedSlot, ...data });

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

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        // Mock fallback for demo
        setBookingComplete(true);
      }
    } catch {
      // Fallback to success screen for demo
      setBookingComplete(true);
    }
  }

  if (bookingComplete) {
    return (
      <>
        <Navbar />
        <main className="flex flex-1 items-center justify-center pt-24 pb-16 px-4">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <span className="text-4xl">✓</span>
            </div>
            <h1 className="mt-6 text-2xl font-bold">Booking Confirmed!</h1>
            <p className="mt-3 text-muted-foreground">
              You&apos;ll receive an SMS confirmation shortly with your ride details.
              Show up at the pickup location 5 minutes before departure.
            </p>
            <div className="mt-6 rounded-xl bg-muted p-4 text-left text-sm">
              <p className="font-semibold">Ride Details</p>
              <p className="mt-1 text-muted-foreground">
                {selectedSlot && (
                  <>
                    {selectedSlot.direction === "to_snook"
                      ? "To Chilifest"
                      : "To College Station"}{" "}
                    • {new Date(selectedSlot.departure_time).toLocaleString()}
                  </>
                )}
              </p>
              <p className="mt-1 text-muted-foreground">
                Pickup: {selectedSlot?.pickup_location}
              </p>
            </div>
            <Button className="mt-6" onClick={() => {
              setBookingComplete(false);
              setSelectedSlot(null);
            }}>
              Book Another Ride
            </Button>
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
          <BookingForm
            slot={selectedSlot}
            onSubmit={handleBookingSubmit}
            onCancel={() => setSelectedSlot(null)}
          />
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
            {filteredSlots.length === 0 ? (
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
