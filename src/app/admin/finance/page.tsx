"use client";

import { useMemo } from "react";
import { DollarSign, TrendingUp, ArrowDownRight, Download } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCents, formatDate, formatTime } from "@/lib/utils";
import { useBookings, useRides, exportToCSV } from "@/lib/data-store";

export default function FinancePage() {
  const { bookings } = useBookings();
  const { rides } = useRides();

  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const cancelled = bookings.filter((b) => b.status === "cancelled");
    const revenue = confirmed.reduce((sum, b) => sum + b.total_price_cents, 0);
    const refunded = cancelled.reduce((sum, b) => sum + b.total_price_cents, 0);
    const stripeFees = Math.round(revenue * 0.029 + confirmed.length * 30); // 2.9% + $0.30
    const netRevenue = revenue - stripeFees;

    // Revenue by direction
    const toSnookRev = confirmed
      .filter((b) => rides.find((r) => r.id === b.ride_slot_id)?.direction === "to_snook")
      .reduce((sum, b) => sum + b.total_price_cents, 0);
    const toCstatRev = revenue - toSnookRev;

    return { revenue, refunded, stripeFees, netRevenue, confirmed: confirmed.length, cancelled: cancelled.length, toSnookRev, toCstatRev };
  }, [bookings, rides]);

  function handleExport() {
    const data = bookings.map((b) => {
      const ride = rides.find((r) => r.id === b.ride_slot_id);
      return {
        booking_id: b.id,
        status: b.status,
        passengers: b.num_passengers,
        amount: `$${(b.total_price_cents / 100).toFixed(2)}`,
        direction: ride?.direction || "unknown",
        departure: ride?.departure_time || "",
        booked_at: b.created_at,
        stripe_id: b.stripe_payment_intent_id || "",
      };
    });
    exportToCSV(data, `12thvan-finance-${new Date().toISOString().slice(0, 10)}`);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finance</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revenue tracking and financial overview</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>

      <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Gross Revenue" value={formatCents(stats.revenue)} icon={DollarSign} trend={`${stats.confirmed} bookings`} trendUp />
        <StatCard title="Stripe Fees" value={formatCents(stats.stripeFees)} icon={ArrowDownRight} trend="2.9% + $0.30/txn" />
        <StatCard title="Net Revenue" value={formatCents(stats.netRevenue)} icon={TrendingUp} trendUp />
        <StatCard title="Refunded" value={formatCents(stats.refunded)} icon={ArrowDownRight} trend={`${stats.cancelled} cancelled`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Revenue by direction */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Direction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-maroon" />
                  <span className="text-sm font-medium">To Chilifest (Snook)</span>
                </div>
                <span className="text-sm font-bold">{formatCents(stats.toSnookRev)}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-maroon transition-all"
                  style={{ width: stats.revenue > 0 ? `${(stats.toSnookRev / stats.revenue) * 100}%` : "0%" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-foreground" />
                  <span className="text-sm font-medium">To College Station</span>
                </div>
                <span className="text-sm font-bold">{formatCents(stats.toCstatRev)}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground transition-all"
                  style={{ width: stats.revenue > 0 ? `${(stats.toCstatRev / stats.revenue) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {bookings.slice(-8).reverse().map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">#{b.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(b.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{formatCents(b.total_price_cents)}</span>
                    <Badge variant={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "muted"}>
                      {b.status}
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
