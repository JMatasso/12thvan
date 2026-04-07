"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Clock, MapPin, Users, Search, Download } from "lucide-react";
import { formatDate, formatTime, formatCents, spotStatus, spotsRemaining, cn } from "@/lib/utils";
import { exportToCSV } from "@/lib/data-store";
import type { RideSlot } from "@/lib/types";

export default function AdminRidesPage() {
  const [rides, setRides] = useState<RideSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [dirFilter, setDirFilter] = useState("all");

  async function fetchRides() {
    try {
      const res = await fetch("/api/rides");
      const data = await res.json();
      setRides(data.rides || []);
    } catch {
      console.error("Failed to fetch rides");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRides(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this ride?")) return;
    await fetch(`/api/rides/${id}`, { method: "DELETE" });
    fetchRides();
  }

  const filtered = useMemo(() => {
    return rides.filter((r) => {
      if (dayFilter === "friday" && !r.departure_time.includes("04-10")) return false;
      if (dayFilter === "saturday" && !r.departure_time.includes("04-11") && !r.departure_time.includes("04-12")) return false;
      if (dirFilter !== "all" && r.direction !== dirFilter) return false;
      return true;
    }).sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
  }, [rides, dayFilter, dirFilter]);

  function handleExport() {
    exportToCSV(filtered.map((r) => ({
      id: r.id, direction: r.direction, departure: r.departure_time,
      booked: r.booked_count, capacity: r.capacity, status: r.status,
      price: `$${(r.price_cents / 100).toFixed(2)}`,
    })), "12thvan-rides");
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manage Rides</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rides.length} total • {rides.filter((r) => r.status === "open").length} open
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />Add Time</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Select options={[{ value: "all", label: "All Days" }, { value: "friday", label: "Fri Apr 10" }, { value: "saturday", label: "Sat Apr 11" }]}
          value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="w-32 h-10 text-sm" />
        <Select options={[{ value: "all", label: "Both Dirs" }, { value: "to_snook", label: "→ Chilifest" }, { value: "to_cstat", label: "← From Chilifest" }]}
          value={dirFilter} onChange={(e) => setDirFilter(e.target.value)} className="w-40 h-10 text-sm" />
      </div>

      {/* Rides list */}
      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading rides...</Card>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No rides yet. Click &quot;Add Time&quot; to create ride slots.
          </Card>
        ) : filtered.map((ride) => {
          const status = spotStatus(ride.capacity, ride.booked_count);

          return (
            <Card key={ride.id} className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white text-xs font-bold",
                    ride.direction === "to_snook" ? "bg-maroon" : "bg-foreground")}>
                    {ride.direction === "to_snook" ? "→S" : "←S"}
                  </div>
                  <div>
                    <p className="font-bold">
                      {ride.direction === "to_snook" ? "To Chilifest" : "From Chilifest"} — {formatDate(ride.departure_time)}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(ride.departure_time)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{ride.booked_count}/{ride.capacity}</span>
                      <span>{formatCents(ride.price_cents)}/seat</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={status === "full" ? "danger" : status === "almost-full" ? "warning" : "success"}>
                    {spotsRemaining(ride.capacity, ride.booked_count)} spots left
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ride.id)} className="text-danger hover:bg-danger/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{ride.pickup_location} → {ride.dropoff_location}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create ride dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Ride Time</DialogTitle></DialogHeader>
          <CreateRideForm onCreated={() => { fetchRides(); setShowCreate(false); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateRideForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    direction: "to_snook",
    date: "2026-04-10",
    time: "14:00",
    capacity: 12,
    price: 30,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const pickup = form.direction === "to_snook"
      ? "Post Oak Mall — 1500 Harvey Rd"
      : "Chilifest Grounds — FM 3058, Snook";
    const dropoff = form.direction === "to_snook"
      ? "Chilifest Grounds — FM 3058, Snook"
      : "Post Oak Mall — 1500 Harvey Rd";

    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: form.direction,
          departure_time: `${form.date}T${form.time}:00Z`,
          pickup_location: pickup,
          dropoff_location: dropoff,
          capacity: form.capacity,
          price_cents: form.price * 100,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create ride");
        setLoading(false);
        return;
      }

      onCreated();
    } catch {
      setError("Failed to create ride");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <Select id="direction" label="Direction" options={[
        { value: "to_snook", label: "To Chilifest (College Station → Snook)" },
        { value: "to_cstat", label: "From Chilifest (Snook → College Station)" },
      ]} value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} />
      <Input id="date" label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <Input id="time" label="Departure Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      <Input id="capacity" label="Max Passengers" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
      <Input id="price" label="Price per Seat ($)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Add Ride Time"}</Button>
    </form>
  );
}
