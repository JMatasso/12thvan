"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock, MapPin, Users, Navigation, Phone, CheckCircle,
  ArrowLeft, Car, UserPlus, MessageSquare, Settings,
} from "lucide-react";
import { formatDate, formatTime, spotsRemaining, cn } from "@/lib/utils";
import { useRides, useBookings } from "@/lib/data-store";
import { useAuth } from "@/lib/auth-store";
import { AuthGuard } from "@/components/auth-guard";
import type { RideSlot } from "@/lib/types";

function DriverContent() {
  const { user } = useAuth();
  const { rides, updateRide } = useRides();
  const { bookings } = useBookings();

  // Get rides assigned to this driver
  const myRides = useMemo(
    () => rides.filter((r) => r.driver_id === user?.id),
    [rides, user]
  );

  // Open rides with no driver assigned (claimable)
  const unassignedRides = useMemo(
    () => rides.filter((r) => !r.driver_id && (r.status === "open" || r.status === "full")),
    [rides]
  );

  const activeRide = myRides.find((r) => r.status === "departed");
  const upcomingRides = myRides
    .filter((r) => r.status === "open" || r.status === "full")
    .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
  const completedRides = myRides.filter((r) => r.status === "completed");

  function claimRide(rideId: string) {
    if (!user) return;
    updateRide(rideId, { driver_id: user.id });
  }

  function getBookingsForRide(rideId: string) {
    return bookings.filter((b) => b.ride_slot_id === rideId && b.status === "confirmed");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Driver header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* Driver photo */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon/10 overflow-hidden">
              {user?.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-maroon">
                  {user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <span className="font-bold text-sm">{user?.name}</span>
              <span className="text-xs text-muted-foreground ml-2">Driver</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/account">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Exit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Active ride banner */}
        {activeRide && (
          <Card className="mb-6 border-success bg-success/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-success">Active Ride</p>
                  <p className="mt-1 text-lg font-bold">
                    {activeRide.direction === "to_snook" ? "→ Chilifest" : "→ College Station"}
                  </p>
                  <p className="text-sm text-muted-foreground">{activeRide.booked_count} passengers</p>
                </div>
                <Button variant="success" onClick={() => updateRide(activeRide.id, { status: "completed" })}>
                  <CheckCircle className="h-4 w-4 mr-1" />Complete
                </Button>
              </div>

              {/* Show passengers for active ride */}
              <div className="mt-4 border-t border-success/20 pt-3">
                <p className="text-xs font-semibold uppercase text-success mb-2">Passengers</p>
                {getBookingsForRide(activeRide.id).map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2 mb-1">
                    <div>
                      <p className="text-sm font-medium">{b.rider_name || `Booking #${b.id.slice(0, 6)}`}</p>
                      <p className="text-xs text-muted-foreground">{b.num_passengers} pax</p>
                    </div>
                    {b.rider_phone && (
                      <a href={`tel:${b.rider_phone}`} className="flex items-center gap-1 text-maroon hover:text-maroon-dark">
                        <Phone className="h-4 w-4" />
                        <span className="text-xs">{b.rider_phone}</span>
                      </a>
                    )}
                  </div>
                ))}
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
              {myRides.reduce((sum, r) => sum + r.booked_count, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Riders</p>
          </Card>
        </div>

        {/* Claim open rides */}
        {unassignedRides.length > 0 && (
          <>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-gold" />
              Open Rides — Claim One
            </h2>
            <div className="flex flex-col gap-3 mb-8">
              {unassignedRides.map((ride) => (
                <Card key={ride.id} className="p-4 border-gold/30 bg-gold/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-white text-xs font-bold",
                        ride.direction === "to_snook" ? "bg-maroon" : "bg-foreground"
                      )}>
                        {ride.direction === "to_snook" ? "→S" : "→CS"}
                      </div>
                      <div>
                        <p className="font-bold">{formatDate(ride.departure_time)}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />{formatTime(ride.departure_time)}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="gold" onClick={() => claimRide(ride.id)}>
                      <UserPlus className="h-4 w-4 mr-1" />Claim
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {ride.booked_count}/{ride.capacity} booked • {ride.pickup_location}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Upcoming rides */}
        <h2 className="text-lg font-bold mb-3">Your Rides</h2>
        <div className="flex flex-col gap-4">
          {upcomingRides.length === 0 && !activeRide ? (
            <Card className="p-8 text-center text-muted-foreground">
              No upcoming rides assigned to you. Claim an open ride above or ask an admin to assign you.
            </Card>
          ) : (
            upcomingRides.map((ride) => {
              const rideBookings = getBookingsForRide(ride.id);

              return (
                <Card key={ride.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-white text-xs font-bold",
                        ride.direction === "to_snook" ? "bg-maroon" : "bg-foreground"
                      )}>
                        {ride.direction === "to_snook" ? "→S" : "→CS"}
                      </div>
                      <div>
                        <p className="font-bold">{formatDate(ride.departure_time)}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />{formatTime(ride.departure_time)}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => updateRide(ride.id, { status: "departed" })}>
                      <Navigation className="h-4 w-4 mr-1" />Depart
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5" />{ride.pickup_location}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Car className="h-3 w-3" />
                    {spotsRemaining(ride.capacity, ride.booked_count)} spots remaining of {ride.capacity}
                  </div>

                  {/* Passenger list with contact info */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                      Passengers ({ride.booked_count})
                    </p>
                    {rideBookings.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {rideBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon/10 text-xs font-bold text-maroon">
                                {(booking.rider_name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {booking.rider_name || `Rider #${booking.id.slice(0, 6)}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {booking.num_passengers} passenger{booking.num_passengers > 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {booking.rider_phone && (
                                <>
                                  <a
                                    href={`sms:${booking.rider_phone}`}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-maroon/10 text-muted-foreground hover:text-maroon transition-colors"
                                    title="Text rider"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </a>
                                  <a
                                    href={`tel:${booking.rider_phone}`}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted hover:bg-maroon/10 text-muted-foreground hover:text-maroon transition-colors"
                                    title="Call rider"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No bookings yet</p>
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
                          {ride.direction === "to_snook" ? "→ Chilifest" : "→ College Station"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(ride.departure_time)} at {formatTime(ride.departure_time)}
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

export default function DriverPage() {
  return (
    <AuthGuard allowedRoles={["driver", "admin"]}>
      <DriverContent />
    </AuthGuard>
  );
}
