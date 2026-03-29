"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Phone, Mail, Car, Clock, Users } from "lucide-react";
import { getAllUsers, addUserToDB, type AuthUser } from "@/lib/auth-store";
import { useRides, useVehicles, useBookings } from "@/lib/data-store";
import { formatDate, formatTime } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

export default function AdminDriversPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState<string | null>(null);
  const drivers = useMemo(() => getAllUsers().filter((u) => u.role === "driver"), []);
  const { rides } = useRides();
  const { vehicles, addVehicle } = useVehicles();
  const { bookings } = useBookings();
  const [, forceUpdate] = useState(0);

  function refreshDrivers() {
    forceUpdate((n) => n + 1);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="mt-1 text-sm text-muted-foreground">{drivers.length} drivers</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" />Add Driver
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {drivers.map((driver) => {
          const driverVehicles = vehicles.filter((v) => v.driver_id === driver.id);
          const driverRides = rides.filter((r) => r.driver_id === driver.id);
          const upcomingRides = driverRides.filter((r) => r.status === "open" || r.status === "full");
          const completedRides = driverRides.filter((r) => r.status === "completed");
          const totalPassengers = driverRides.reduce((sum, r) => sum + r.booked_count, 0);

          return (
            <Card key={driver.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon/10 text-lg font-bold text-maroon">
                    {driver.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{driver.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{driver.email}</span>
                      {driver.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{driver.phone}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-center">
                  <div><p className="text-xl font-bold">{upcomingRides.length}</p><p className="text-xs text-muted-foreground">Upcoming</p></div>
                  <div><p className="text-xl font-bold">{completedRides.length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
                  <div><p className="text-xl font-bold">{totalPassengers}</p><p className="text-xs text-muted-foreground">Passengers</p></div>
                </div>
              </div>

              {/* Vehicles */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Vehicles</p>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddVehicle(driver.id)} className="h-7 px-2 text-xs">
                    <Plus className="h-3 w-3 mr-1" />Add Vehicle
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {driverVehicles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No vehicles assigned</p>
                  ) : driverVehicles.map((v) => (
                    <Badge key={v.id} variant="muted">
                      <Car className="h-3 w-3 mr-1" />{v.description} ({v.capacity} seats)
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Upcoming rides */}
              {upcomingRides.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Upcoming Schedule</p>
                  <div className="flex flex-wrap gap-2">
                    {upcomingRides.slice(0, 4).map((r) => (
                      <div key={r.id} className="rounded-lg bg-muted/50 px-3 py-1.5 text-xs">
                        <span className="font-medium">{formatDate(r.departure_time)}</span>{" "}
                        <span className="text-muted-foreground">{formatTime(r.departure_time)}</span>{" "}
                        <span className="text-muted-foreground">{r.direction === "to_snook" ? "→S" : "→CS"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add driver dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Driver</DialogTitle></DialogHeader>
          <AddDriverForm onAdded={() => { refreshDrivers(); setShowAdd(false); }} />
        </DialogContent>
      </Dialog>

      {/* Add vehicle dialog */}
      <Dialog open={!!showAddVehicle} onOpenChange={() => setShowAddVehicle(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vehicle</DialogTitle></DialogHeader>
          <AddVehicleForm driverId={showAddVehicle || ""} onAdded={(v) => { addVehicle(v); setShowAddVehicle(null); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddDriverForm({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "driver123" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) { setError("Name and email required"); return; }
    const success = addUserToDB({ id: `driver-${Date.now()}`, name: form.name, email: form.email, phone: form.phone, role: "driver", password: form.password });
    if (!success) { setError("Email already exists"); return; }
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <Input id="name" label="Name" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input id="email" label="Email" type="email" placeholder="jane@12thvan.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input id="phone" label="Phone" type="tel" placeholder="(979) 555-1234" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <Input id="password" label="Password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit">Add Driver</Button>
    </form>
  );
}

function AddVehicleForm({ driverId, onAdded }: { driverId: string; onAdded: (v: Vehicle) => void }) {
  const [form, setForm] = useState({ type: "car" as Vehicle["type"], capacity: 4, description: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description) return;
    onAdded({ id: `v-${Date.now()}`, driver_id: driverId, ...form });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <Select id="type" label="Type" options={[
        { value: "car", label: "Car (Sedan/SUV)" },
        { value: "truck", label: "Truck (Crew Cab)" },
        { value: "van", label: "Passenger Van" },
      ]} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Vehicle["type"] })} />
      <Input id="description" label="Description" placeholder="e.g., Silver F-150 Crew Cab" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <Input id="capacity" label="Passenger Capacity" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
      <Button type="submit" disabled={!form.description}>Add Vehicle</Button>
    </form>
  );
}
