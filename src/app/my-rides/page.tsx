"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { mockBookings, mockRideSlots } from "@/lib/mock-data";

export default function MyRidesPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("12thvan_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Enrich bookings with ride slot info
  const enrichedBookings = mockBookings.map((b) => ({
    ...b,
    ride_slot: mockRideSlots.find((rs) => rs.id === b.ride_slot_id),
  }));

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Rides</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {user ? `Logged in as ${user.name}` : "Your upcoming and past rides"}
              </p>
            </div>
            <Link href="/book">
              <Button size="sm">
                Book a Ride
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            {enrichedBookings.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">No rides booked yet.</p>
                <Link href="/book">
                  <Button className="mt-4">Book Your First Ride</Button>
                </Link>
              </div>
            ) : (
              enrichedBookings.map((booking) => (
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

                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-bold text-foreground">
                      {formatCents(booking.total_price_cents)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Booked {formatDate(booking.created_at)}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
