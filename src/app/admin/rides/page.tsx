"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Clock, MapPin, Users, Search, Download } from "lucide-react";
import { formatDate, formatTime, formatCents, spotStatus, spotsRemaining, cn } from "@/lib/utils";
import { useRides, useVehicles, exportToCSV } from "@/lib/data-store";
import { getAllUsers } from "@/lib/auth-store";
import type { RideSlot } from "@/lib/types";

export default function AdminRidesPage() {
  const { rides, addRide, updateRide, deleteRide } = useRides();
  const { vehicles } = useVehicles();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [dirFilter, setDirFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const drivers = useMemo(() => getAllUsers().filter((u) => u.role === "driver"), []);

  const filtered = useMemo(() => {
    return rides.filter((r) => {
      if (dayFilter === "friday" && !r.departure_time.includes("04-10")) return false;
      if (dayFilter === "saturday" && !r.departure_time.includes("04-11") && !r.departure_time.includes("04-12")) return false;
      if (dirFilter !== "all" && r.direction !== dirFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const v = vehicles.find((v) => v.id === r.vehicle_id);
        const d = drivers.find((d) => d.id === r.driver_id);
        if (
          !r.pickup_location.toLowerCase().includes(q) &&
          !(v?.description.toLowerCase().includes(q)) &&
          !(d?.name.toLowerCase().includes(q)) &&
          !r.id.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    }).sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
  }, [rides, dayFilter, dirFilter, statusFilter, search, vehicles, drivers]);

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
            {rides.length} total • {rides.filter((r) => r.status === "open").length} open • {rides.filter((r) => r.status === "full").length} full
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-1" />New Ride</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Search rides..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-white pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30" />
        </div>
        <Select options={[{ value: "all", label: "All Days" }, { value: "friday", label: "Fri Apr 10" }, { value: "saturday", label: "Sat Apr 11" }]}
          value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="w-32 h-10 text-sm" />
        <Select options={[{ value: "all", label: "Both Dirs" }, { value: "to_snook", label: "→ Snook" }, { value: "to_cstat", label: "→ CSTAT" }]}
          value={dirFilter} onChange={(e) => setDirFilter(e.target.value)} className="w-32 h-10 text-sm" />
        <Select options={[{ value: "all", label: "All Status" }, { value: "open", label: "Open" }, { value: "full", label: "Full" }, { value: "departed", label: "Departed" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }]}
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36 h-10 text-sm" />
      </div>

      {/* Rides list */}
      <div className="mt-6 flex flex-col gap-3">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No rides match your filters</Card>
        ) : filtered.map((ride) => {
          const vehicle = vehicles.find((v) => v.id === ride.vehicle_id);
          const driver = drivers.find((d) => d.id === ride.driver_id);
          const status = spotStatus(ride.capacity, ride.booked_count);

          return (
            <Card key={ride.id} className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white text-xs font-bold",
                    ride.direction === "to_snook" ? "bg-maroon" : "bg-foreground")}>
                    {ride.direction === "to_snook" ? "→S" : "→CS"}
                  </div>
                  <div>
                    <p className="font-bold">{formatDate(ride.departure_time)}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatTime(ride.departure_time)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{ride.booked_count}/{ride.capacity}</span>
                      <span>{formatCents(ride.price_cents)}/ea</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={status === "full" ? "danger" : status === "almost-full" ? "warning" : "success"}>
                    {spotsRemaining(ride.capacity, ride.booked_count)} spots
                  </Badge>
                  <Select options={[
                    { value: "open", label: "Open" }, { value: "full", label: "Full" },
                    { value: "departed", label: "Departed" }, { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                  ]} value={ride.status}
                    onChange={(e) => updateRide(ride.id, { status: e.target.value as RideSlot["status"] })}
                    className="w-32 h-9 text-sm" />
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("Delete this ride?")) deleteRide(ride.id);
                  }} className="text-danger hover:bg-danger/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ride.pickup_location}</span>
                {vehicle && <span>Vehicle: {vehicle.description}</span>}
                {driver && <span>Driver: {driver.name}</span>}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create ride dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New Ride</DialogTitle></DialogHeader>
          <CreateRideForm vehicles={vehicles} drivers={drivers} onCreated={(r) => { addRide(r); setShowCreate(false); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateRideForm({ vehicles, drivers, onCreated }: {
  vehicles: { id: string; description: string; capacity: number }[];
  drivers: { id: string; name: string }[];
  onCreated: (ride: RideSlot) => void;
}) {
  const [form, setForm] = useState({
    direction: "to_snook", date: "2026-04-10", time: "14:00",
    vehicle_id: vehicles[0]?.id || "", driver_id: drivers[0]?.id || "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const vehicle = vehicles.find((v) => v.id === form.vehicle_id);
    onCreated({
      id: `rs-${Date.now()}`, vehicle_id: form.vehicle_id, driver_id: form.driver_id,
      direction: form.direction as "to_snook" | "to_cstat",
      departure_time: `${form.date}T${form.time}:00Z`,
      pickup_location: form.direction === "to_snook" ? "Post Oak Mall — 1500 Harvey Rd" : "Chilifest Grounds — FM 3058, Snook",
      dropoff_location: form.direction === "to_snook" ? "Chilifest Grounds — FM 3058, Snook" : "Post Oak Mall — 1500 Harvey Rd",
      capacity: vehicle?.capacity || 5, booked_count: 0, price_cents: 3000, status: "open",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <Select id="direction" label="Direction" options={[
        { value: "to_snook", label: "To Chilifest (Snook)" },
        { value: "to_cstat", label: "To College Station" },
      ]} value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} />
      <Input id="date" label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <Input id="time" label="Departure Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      <Select id="vehicle" label="Vehicle" options={vehicles.map((v) => ({ value: v.id, label: `${v.description} (${v.capacity} seats)` }))}
        value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} />
      <Select id="driver" label="Driver" options={drivers.map((d) => ({ value: d.id, label: d.name }))}
        value={form.driver_id} onChange={(e) => setForm({ ...form, driver_id: e.target.value })} />
      <Button type="submit">Create Ride</Button>
    </form>
  );
}
