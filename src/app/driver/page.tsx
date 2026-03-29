"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  Users,
  Navigation,
  Phone,
  CheckCircle,
  ArrowLeft,
  Car,
} from "lucide-react";
import { formatDate, formatTime, spotsRemaining } from "@/lib/utils";
import { mockRideSlots, mockBookings, mockVehicles } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { RideSlot } from "@/lib/types";

export default function DriverPage() {
  const [rides, setRides] = useState<RideSlot[]>(
    mockRideSlots.filter((r) => r.driver_id === "d1")
  );

  function updateStatus(id: string, status: RideSlot["status"]) {
    setRides(rides.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const activeRide = rides.find((r) => r.status === "departed");
  const upcomingRides = rides
    .filter((r) => r.status === "open" || r.status === "full")
    .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
  const completedRides = rides.filter((r) => r.status === "completed");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Driver header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-maroon text-white font-black text-xs">
              12
            </div>
            <span className="font-bold">Driver View</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Exit
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Active ride banner */}
        {activeRide && (
          <Card className="mb-6 border-success bg-success/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-success">
                    Active Ride
                  </p>
                  <p className="mt-1 text-lg font-bold">
                    {activeRide.direction === "to_snook"
                      ? "→ Chilifest"
                      : "→ College Station"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeRide.booked_count} passengers
                  </p>
                </div>
                <Button
                  variant="success"
                  onClick={() => updateStatus(activeRide.id, "completed")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{upcomingRides.length}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{completedRides.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">
              {rides.reduce((sum, r) => sum + r.booked_count, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Riders</p>
          </Card>
        </div>

        {/* Upcoming rides */}
        <h2 className="text-lg font-bold mb-3">Your Rides</h2>
        <div className="flex flex-col gap-4">
          {upcomingRides.length === 0 && !activeRide ? (
            <Card className="p-8 text-center text-muted-foreground">
              No upcoming rides assigned to you.
            </Card>
          ) : (
            upcomingRides.map((ride) => {
              const vehicle = mockVehicles.find((v) => v.id === ride.vehicle_id);
              const rideBookings = mockBookings.filter(
                (b) => b.ride_slot_id === ride.id && b.status === "confirmed"
              );

              return (
                <Card key={ride.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl text-white text-xs font-bold",
                          ride.direction === "to_snook" ? "bg-maroon" : "bg-foreground"
                        )}
                      >
                        {ride.direction === "to_snook" ? "→S" : "→CS"}
                      </div>
                      <div>
                        <p className="font-bold">{formatDate(ride.departure_time)}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(ride.departure_time)}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(ride.id, "departed")}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Depart
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5" />
                    {ride.pickup_location}
                  </div>

                  {vehicle && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Car className="h-3 w-3" />
                      {vehicle.description} — {spotsRemaining(ride.capacity, ride.booked_count)} spots remaining
                    </div>
                  )}

                  {/* Passenger list */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Passengers ({ride.booked_count})
                    </p>
                    {rideBookings.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {rideBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                Booking #{booking.id.slice(0, 6)} — {booking.num_passengers} pax
                              </span>
                            </div>
                            <button className="text-maroon hover:text-maroon-dark">
                              <Phone className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No bookings yet
                      </p>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Completed rides */}
        {completedRides.length > 0 && (
          <>
            <h2 className="text-lg font-bold mb-3 mt-8">Completed</h2>
            <div className="flex flex-col gap-3">
              {completedRides.map((ride) => (
                <Card key={ride.id} className="p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-sm font-medium">
                          {ride.direction === "to_snook"
                            ? "→ Chilifest"
                            : "→ College Station"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(ride.departure_time)} at{" "}
                          {formatTime(ride.departure_time)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Done</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
