"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Search, Download, XCircle, RotateCcw } from "lucide-react";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { useBookings, useRides, exportToCSV } from "@/lib/data-store";

export default function AdminBookingsPage() {
  const { bookings, cancelBooking, updateBooking } = useBookings();
  const { rides } = useRides();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const enriched = useMemo(() =>
    bookings.map((b) => ({
      ...b,
      ride_slot: rides.find((r) => r.id === b.ride_slot_id),
    })),
    [bookings, rides]
  );

  const filtered = useMemo(() => {
    return enriched.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!b.id.toLowerCase().includes(q) && !b.user_id.toLowerCase().includes(q)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [enriched, statusFilter, search]);

  const revenue = useMemo(() =>
    enriched.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.total_price_cents, 0),
    [enriched]
  );

  function handleExport() {
    exportToCSV(filtered.map((b) => ({
      booking_id: b.id, user_id: b.user_id, passengers: b.num_passengers,
      amount: `$${(b.total_price_cents / 100).toFixed(2)}`, status: b.status,
      direction: b.ride_slot?.direction || "", departure: b.ride_slot?.departure_time || "",
      booked_at: b.created_at,
    })), "12thvan-bookings");
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {enriched.length} total • {formatCents(revenue)} revenue
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />Export
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by booking or user ID..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30" />
        </div>
        <Select options={[
          { value: "all", label: "All Status" },
          { value: "confirmed", label: "Confirmed" },
          { value: "cancelled", label: "Cancelled" },
          { value: "completed", label: "Completed" },
          { value: "no_show", label: "No Show" },
        ]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36 h-10 text-sm" />
      </div>

      {/* Bookings table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Booking", "Ride", "Passengers", "Amount", "Status", "Booked", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No bookings match your filters</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">#{b.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      {b.ride_slot && (
                        <div className="text-sm">
                          <p className="font-medium">{b.ride_slot.direction === "to_snook" ? "→ Chilifest" : "→ CSTAT"}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(b.ride_slot.departure_time)} {formatTime(b.ride_slot.departure_time)}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{b.num_passengers}</td>
                    <td className="px-4 py-3 text-sm font-bold">{formatCents(b.total_price_cents)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : b.status === "no_show" ? "warning" : "muted"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(b.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {b.status === "confirmed" && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => cancelBooking(b.id)} className="text-danger hover:bg-danger/10 h-8 px-2">
                              <XCircle className="h-3.5 w-3.5 mr-1" />Cancel
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateBooking(b.id, { status: "no_show" })} className="h-8 px-2">
                              No Show
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateBooking(b.id, { status: "completed" })} className="text-success h-8 px-2">
                              Complete
                            </Button>
                          </>
                        )}
                        {b.status === "cancelled" && (
                          <Button size="sm" variant="ghost" onClick={() => updateBooking(b.id, { status: "confirmed" })} className="h-8 px-2">
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />Restore
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
