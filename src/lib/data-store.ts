"use client";

import { useState, useEffect, useCallback } from "react";
import type { RideSlot, Booking, Vehicle } from "./types";

const RIDES_KEY = "12thvan_rides";
const BOOKINGS_KEY = "12thvan_bookings";
const VEHICLES_KEY = "12thvan_vehicles";
const INCIDENTS_KEY = "12thvan_incidents";
const COMMS_KEY = "12thvan_comms_log";
const ANNOUNCEMENT_KEY = "12thvan_announcement";
const CONFIG_KEY = "12thvan_config";

function load<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- RIDES ----
export function useRides() {
  const [rides, setRides] = useState<RideSlot[]>([]);
  useEffect(() => { setRides(load(RIDES_KEY)); }, []);

  const persist = useCallback((updated: RideSlot[]) => {
    setRides(updated);
    save(RIDES_KEY, updated);
  }, []);

  const addRide = useCallback((ride: RideSlot) => {
    const updated = [...load<RideSlot>(RIDES_KEY), ride];
    persist(updated);
  }, [persist]);

  const updateRide = useCallback((id: string, changes: Partial<RideSlot>) => {
    const current = load<RideSlot>(RIDES_KEY);
    const updated = current.map((r) => (r.id === id ? { ...r, ...changes } : r));
    persist(updated);
  }, [persist]);

  const deleteRide = useCallback((id: string) => {
    const current = load<RideSlot>(RIDES_KEY);
    persist(current.filter((r) => r.id !== id));
  }, [persist]);

  return { rides, addRide, updateRide, deleteRide, refresh: () => setRides(load(RIDES_KEY)) };
}

// ---- BOOKINGS ----
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => { setBookings(load(BOOKINGS_KEY)); }, []);

  const persist = useCallback((updated: Booking[]) => {
    setBookings(updated);
    save(BOOKINGS_KEY, updated);
  }, []);

  const addBooking = useCallback((booking: Booking) => {
    const current = load<Booking>(BOOKINGS_KEY);
    persist([...current, booking]);
  }, [persist]);

  const updateBooking = useCallback((id: string, changes: Partial<Booking>) => {
    const current = load<Booking>(BOOKINGS_KEY);
    persist(current.map((b) => (b.id === id ? { ...b, ...changes } : b)));
  }, [persist]);

  const cancelBooking = useCallback((id: string) => {
    const current = load<Booking>(BOOKINGS_KEY);
    persist(current.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)));
  }, [persist]);

  return { bookings, addBooking, updateBooking, cancelBooking };
}

// ---- VEHICLES ----
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  useEffect(() => { setVehicles(load(VEHICLES_KEY)); }, []);

  const persist = useCallback((updated: Vehicle[]) => {
    setVehicles(updated);
    save(VEHICLES_KEY, updated);
  }, []);

  const addVehicle = useCallback((v: Vehicle) => {
    const current = load<Vehicle>(VEHICLES_KEY);
    persist([...current, v]);
  }, [persist]);

  const deleteVehicle = useCallback((id: string) => {
    const current = load<Vehicle>(VEHICLES_KEY);
    persist(current.filter((v) => v.id !== id));
  }, [persist]);

  return { vehicles, addVehicle, deleteVehicle };
}

// ---- INCIDENTS ----
export interface Incident {
  id: string;
  type: "accident" | "breakdown" | "altercation" | "medical" | "other";
  description: string;
  location: string;
  driver_id?: string;
  ride_id?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved";
  created_at: string;
  resolved_at?: string;
  notes: string;
}

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  useEffect(() => { setIncidents(load(INCIDENTS_KEY)); }, []);

  const persist = useCallback((updated: Incident[]) => {
    setIncidents(updated);
    save(INCIDENTS_KEY, updated);
  }, []);

  const addIncident = useCallback((incident: Incident) => {
    persist([...load<Incident>(INCIDENTS_KEY), incident]);
  }, [persist]);

  const updateIncident = useCallback((id: string, changes: Partial<Incident>) => {
    const current = load<Incident>(INCIDENTS_KEY);
    persist(current.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }, [persist]);

  return { incidents, addIncident, updateIncident };
}

// ---- COMMS LOG ----
export interface CommEntry {
  id: string;
  type: "sms" | "announcement";
  recipients: string;
  message: string;
  sent_at: string;
  sent_by: string;
}

export function useCommsLog() {
  const [log, setLog] = useState<CommEntry[]>([]);
  useEffect(() => { setLog(load(COMMS_KEY)); }, []);

  const addEntry = useCallback((entry: CommEntry) => {
    const updated = [...load<CommEntry>(COMMS_KEY), entry];
    save(COMMS_KEY, updated);
    setLog(updated);
  }, []);

  return { log, addEntry };
}

// ---- ANNOUNCEMENT ----
export function useAnnouncement() {
  const [text, setText] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setText(localStorage.getItem(ANNOUNCEMENT_KEY) || "");
    }
  }, []);

  const setAnnouncement = useCallback((msg: string) => {
    setText(msg);
    localStorage.setItem(ANNOUNCEMENT_KEY, msg);
  }, []);

  return { announcement: text, setAnnouncement };
}

// ---- CONFIG ----
export interface SiteConfig {
  price_one_way: number;
  price_round_trip: number;
  pickup_cstat: string;
  pickup_snook: string;
  operating_hours_start: string;
  operating_hours_end: string;
  max_hours_per_driver: number;
}

const DEFAULT_CONFIG: SiteConfig = {
  price_one_way: 30,
  price_round_trip: 60,
  pickup_cstat: "Post Oak Mall — 1500 Harvey Rd, College Station",
  pickup_snook: "Chilifest Grounds — FM 3058, Snook",
  operating_hours_start: "12:00",
  operating_hours_end: "02:00",
  max_hours_per_driver: 8,
};

export function useConfig() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) setConfig(JSON.parse(raw));
    } catch {}
  }, []);

  const saveConfig = useCallback((updated: SiteConfig) => {
    setConfig(updated);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  }, []);

  return { config, saveConfig };
}

// ---- CSV EXPORT ----
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((h) => {
        const val = String(row[h] ?? "");
        return val.includes(",") ? `"${val}"` : val;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
