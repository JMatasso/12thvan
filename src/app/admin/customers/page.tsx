"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Phone, Mail, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useBookings, exportToCSV } from "@/lib/data-store";
import { formatCents } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth-store";
import type { UserRole } from "@/lib/types";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const { bookings } = useBookings();

  useEffect(() => {
    async function fetchRiders() {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("role", "rider")
        .order("created_at", { ascending: false });
      if (data) {
        setAllUsers(data.map((u) => ({
          id: u.id,
          auth_id: u.auth_id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role as UserRole,
          photo_url: u.photo_url,
          bio: u.bio,
        })));
      }
    }
    fetchRiders();
  }, []);

  const customers = useMemo(() => {
    const map = new Map<string, {
      user: AuthUser;
      bookingCount: number;
      totalSpent: number;
      lastBooking: string;
      status: string;
    }>();

    for (const u of allUsers) {
      const userBookings = bookings.filter((b) => b.user_id === u.id);
      map.set(u.id, {
        user: u,
        bookingCount: userBookings.length,
        totalSpent: userBookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.total_price_cents, 0),
        lastBooking: userBookings.length > 0 ? userBookings[userBookings.length - 1].created_at : "",
        status: userBookings.some((b) => b.status === "confirmed") ? "active" : "inactive",
      });
    }

    for (const b of bookings) {
      if (!map.has(b.user_id)) {
        map.set(b.user_id, {
          user: { id: b.user_id, auth_id: "", name: b.rider_name || `Rider`, email: b.rider_email || "", phone: b.rider_phone, role: "rider" },
          bookingCount: 1,
          totalSpent: b.status === "confirmed" ? b.total_price_cents : 0,
          lastBooking: b.created_at,
          status: b.status === "confirmed" ? "active" : "inactive",
        });
      }
    }

    return Array.from(map.values());
  }, [allUsers, bookings]);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.user.name.toLowerCase().includes(q) ||
        c.user.email.toLowerCase().includes(q) ||
        (c.user.phone && c.user.phone.includes(q))
    );
  }, [customers, search]);

  function handleExport() {
    exportToCSV(
      filtered.map((c) => ({
        name: c.user.name,
        email: c.user.email,
        phone: c.user.phone || "",
        bookings: c.bookingCount,
        total_spent: `$${(c.totalSpent / 100).toFixed(2)}`,
        status: c.status,
      })),
      "12thvan-customers"
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{customers.length} total customers</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-border bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {search ? "No customers match your search" : "No customers yet"}
          </Card>
        ) : (
          filtered.map((c) => (
            <Card key={c.user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon/10 text-sm font-bold text-maroon overflow-hidden flex-shrink-0">
                    {c.user.photo_url ? (
                      <img src={c.user.photo_url} alt={c.user.name} className="h-full w-full object-cover" />
                    ) : (
                      c.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{c.user.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {c.user.email && (
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.user.email}</span>
                      )}
                      {c.user.phone && (
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.user.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCents(c.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground">{c.bookingCount} booking{c.bookingCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
