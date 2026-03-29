"use client";

import { useMemo } from "react";
import { DollarSign, Car, Users, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCents, formatTime, formatDate, spotsRemaining } from "@/lib/utils";
import { useRides, useBookings, useAnnouncement } from "@/lib/data-store";
import { useAuth } from "@/lib/auth-store";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { rides } = useRides();
  const { bookings } = useBookings();
  const { announcement } = useAnnouncement();

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const revenue = confirmed.reduce((sum, b) => sum + b.total_price_cents, 0);
    const passengers = confirmed.reduce((sum, b) => sum + b.num_passengers, 0);
    const activeRides = rides.filter((r) => r.status === "open" || r.status === "full").length;
    const departedRides = rides.filter((r) => r.status === "departed").length;
    return { revenue, passengers, activeRides, departedRides, totalBookings: confirmed.length };
  }, [rides, bookings]);

  const upcomingRides = useMemo(() =>
    rides
      .filter((r) => r.status === "open" || r.status === "full")
      .sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime())
      .slice(0, 6),
    [rides]
  );

  const recentBookings = useMemo(() =>
    [...bookings]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6),
    [bookings]
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user?.name}. Chilifest 2026 — April 10 & 11.
          </p>
        </div>
        <Link href="/admin/comms">
          <Button variant="secondary" size="sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Announcements
          </Button>
        </Link>
      </div>

      {/* Active announcement banner */}
      {announcement && (
        <div className="mt-4 rounded-xl bg-warning/10 border border-warning/30 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Live Announcement</p>
            <p className="text-sm text-muted-foreground">{announcement}</p>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-5">
        <StatCard title="Revenue" value={formatCents(stats.revenue)} icon={DollarSign} trend={`${stats.totalBookings} bookings`} trendUp />
        <StatCard title="Passengers" value={stats.passengers} icon={Users} />
        <StatCard title="Upcoming Rides" value={stats.activeRides} icon={Car} />
        <StatCard title="In Progress" value={stats.departedRides} icon={TrendingUp} trend={stats.departedRides > 0 ? "Vehicles on the road" : ""} trendUp />
        <StatCard title="Total Rides" value={rides.length} icon={Clock} />
      </div>

      {/* System health */}
      <div className="mt-6 grid gap-4 grid-cols-3">
        {[
          { label: "Rides", status: stats.activeRides > 0 ? "green" : "yellow", detail: `${stats.activeRides} open` },
          { label: "Bookings", status: stats.totalBookings > 0 ? "green" : "yellow", detail: `${stats.totalBookings} confirmed` },
          { label: "Capacity", status: rides.some((r) => r.status === "full") ? "yellow" : "green", detail: rides.filter((r) => r.status === "full").length + " full rides" },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${item.status === "green" ? "bg-success" : item.status === "yellow" ? "bg-warning" : "bg-danger"}`} />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Upcoming rides */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Rides</CardTitle>
            <Link href="/admin/rides"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {upcomingRides.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No upcoming rides</p>
              ) : upcomingRides.map((ride) => (
                <div key={ride.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-maroon/10 text-xs font-bold text-maroon">
                      {ride.direction === "to_snook" ? "→S" : "→CS"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{formatDate(ride.departure_time)} at {formatTime(ride.departure_time)}</p>
                      <p className="text-xs text-muted-foreground">{ride.booked_count}/{ride.capacity} booked</p>
                    </div>
                  </div>
                  <Badge variant={ride.status === "full" ? "danger" : spotsRemaining(ride.capacity, ride.booked_count) <= 2 ? "warning" : "success"}>
                    {ride.status === "full" ? "Full" : `${spotsRemaining(ride.capacity, ride.booked_count)} open`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Link href="/admin/bookings"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No bookings yet</p>
              ) : recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                  <div>
                    <p className="text-sm font-medium">Booking #{booking.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{booking.num_passengers} pax • {formatDate(booking.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCents(booking.total_price_cents)}</p>
                    <Badge variant={booking.status === "confirmed" ? "success" : booking.status === "cancelled" ? "danger" : "muted"}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
