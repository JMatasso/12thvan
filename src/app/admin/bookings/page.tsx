"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Search, Download, XCircle, CheckCircle, X } from "lucide-react";
import { formatDate, formatTime, formatCents } from "@/lib/utils";
import { exportToCSV } from "@/lib/data-store";
import type { Booking } from "@/lib/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      console.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); }, []);

  async function handleAction(bookingId: string, action: "confirm" | "deny") {
    setActing(bookingId);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, action }),
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch {
      alert("Failed to update booking");
    } finally {
      setActing(null);
    }
  }

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !b.id.toLowerCase().includes(q) &&
          !(b.rider_name || "").toLowerCase().includes(q) &&
          !(b.rider_email || "").toLowerCase().includes(q) &&
          !(b.rider_phone || "").includes(q)
        ) return false;
      }
      return true;
    }).sort((a, b) => {
      // Pending first, then by date
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [bookings, statusFilter, search]);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  function handleExport() {
    exportToCSV(filtered.map((b) => ({
      booking_id: b.id, name: b.rider_name, email: b.rider_email, phone: b.rider_phone,
      passengers: b.num_passengers, amount: `$${(b.total_price_cents / 100).toFixed(2)}`,
      status: b.status, departure: b.ride_slot?.departure_time || "", booked_at: b.created_at,
    })), "12thvan-bookings");
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingCount > 0 && <span className="text-amber-600 font-medium">{pendingCount} pending • </span>}
            {confirmedCount} confirmed • {bookings.length} total
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />Export
        </Button>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <strong>{pendingCount} booking{pendingCount > 1 ? "s" : ""} waiting for approval.</strong> Review and confirm or deny below.
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name, email, phone..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30" />
        </div>
        <Select options={[
          { value: "all", label: "All Status" },
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
          { value: "denied", label: "Denied" },
          { value: "cancelled", label: "Cancelled" },
          { value: "completed", label: "Completed" },
        ]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36 h-10 text-sm" />
      </div>

      {/* Bookings table */}
      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Rider", "Ride", "Seats", "Amount", "Status", "Booked", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No bookings match your filters</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b.id} className={`border-b border-border last:border-0 hover:bg-muted/50 ${b.status === "pending" ? "bg-amber-50/50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="font-medium">{b.rider_name}</p>
                        <p className="text-xs text-muted-foreground">{b.rider_email}</p>
                        {b.rider_phone && <p className="text-xs text-muted-foreground">{b.rider_phone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {b.ride_slot && (
                        <div className="text-sm">
                          <p className="font-medium">{b.ride_slot.direction === "to_snook" ? "→ Chilifest" : "← From Chilifest"}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(b.ride_slot.departure_time)} {formatTime(b.ride_slot.departure_time)}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{b.num_passengers}</td>
                    <td className="px-4 py-3 text-sm font-bold">{formatCents(b.total_price_cents)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        b.status === "confirmed" ? "success" :
                        b.status === "pending" ? "warning" :
                        b.status === "denied" || b.status === "cancelled" ? "danger" :
                        "muted"
                      }>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(b.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {b.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(b.id, "confirm")}
                              disabled={acting === b.id}
                              className="h-8 px-3 bg-success hover:bg-success/90 text-white"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              {acting === b.id ? "..." : "Confirm"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleAction(b.id, "deny")}
                              disabled={acting === b.id}
                              className="text-danger hover:bg-danger/10 h-8 px-3"
                            >
                              <X className="h-3.5 w-3.5 mr-1" />Deny
                            </Button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <Button size="sm" variant="ghost" onClick={() => handleAction(b.id, "deny")} className="text-danger hover:bg-danger/10 h-8 px-2">
                            <XCircle className="h-3.5 w-3.5 mr-1" />Cancel
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
