"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, AlertTriangle, Clock, MapPin, ShieldAlert } from "lucide-react";
import { useIncidents, type Incident } from "@/lib/data-store";
import { formatDate, formatTime } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";

export default function SafetyPage() {
  const { user } = useAuth();
  const { incidents, addIncident, updateIncident } = useIncidents();
  const [showCreate, setShowCreate] = useState(false);

  const openCount = incidents.filter((i) => i.status !== "resolved").length;
  const criticalCount = incidents.filter((i) => i.severity === "critical" && i.status !== "resolved").length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Safety & Incidents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {incidents.length} total incidents • {openCount} open{criticalCount > 0 ? ` • ${criticalCount} critical` : ""}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Report Incident
        </Button>
      </div>

      {/* Critical alert */}
      {criticalCount > 0 && (
        <div className="mt-4 rounded-xl bg-danger/10 border border-danger/30 p-4 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-danger" />
          <span className="text-sm font-semibold text-danger">
            {criticalCount} critical incident{criticalCount > 1 ? "s" : ""} requiring attention
          </span>
        </div>
      )}

      {/* Incidents list */}
      <div className="mt-6 flex flex-col gap-4">
        {incidents.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No incidents reported. Stay safe out there.
          </Card>
        ) : (
          [...incidents].reverse().map((incident) => (
            <Card key={incident.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-3 w-3 rounded-full flex-shrink-0 ${
                    incident.severity === "critical" ? "bg-danger animate-pulse" :
                    incident.severity === "high" ? "bg-danger" :
                    incident.severity === "medium" ? "bg-warning" : "bg-muted-foreground"
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={
                        incident.type === "accident" ? "danger" :
                        incident.type === "breakdown" ? "warning" : "muted"
                      }>
                        {incident.type}
                      </Badge>
                      <Badge variant={
                        incident.severity === "critical" ? "danger" :
                        incident.severity === "high" ? "danger" :
                        incident.severity === "medium" ? "warning" : "muted"
                      }>
                        {incident.severity}
                      </Badge>
                      <Badge variant={
                        incident.status === "resolved" ? "success" :
                        incident.status === "investigating" ? "warning" : "danger"
                      }>
                        {incident.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm">{incident.description}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{incident.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{formatDate(incident.created_at)} at {formatTime(incident.created_at)}
                      </span>
                    </div>
                    {incident.notes && (
                      <p className="mt-2 text-xs text-muted-foreground italic">Notes: {incident.notes}</p>
                    )}
                  </div>
                </div>

                {incident.status !== "resolved" && (
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    {incident.status === "open" && (
                      <Button size="sm" variant="secondary" onClick={() => updateIncident(incident.id, { status: "investigating" })}>
                        Investigate
                      </Button>
                    )}
                    <Button size="sm" variant="success" onClick={() => updateIncident(incident.id, { status: "resolved", resolved_at: new Date().toISOString() })}>
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create incident dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Incident</DialogTitle>
          </DialogHeader>
          <IncidentForm onCreated={(i) => { addIncident(i); setShowCreate(false); }} userName={user?.name || "Admin"} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IncidentForm({ onCreated, userName }: { onCreated: (i: Incident) => void; userName: string }) {
  const [form, setForm] = useState({
    type: "breakdown" as Incident["type"],
    severity: "medium" as Incident["severity"],
    description: "",
    location: "",
    notes: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description || !form.location) return;
    onCreated({
      id: `inc-${Date.now()}`,
      ...form,
      status: "open",
      created_at: new Date().toISOString(),
      notes: form.notes || `Reported by ${userName}`,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <Select id="type" label="Type" options={[
        { value: "accident", label: "Accident" },
        { value: "breakdown", label: "Vehicle Breakdown" },
        { value: "altercation", label: "Altercation" },
        { value: "medical", label: "Medical Emergency" },
        { value: "other", label: "Other" },
      ]} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Incident["type"] })} />
      <Select id="severity" label="Severity" options={[
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "critical", label: "Critical — Requires Immediate Action" },
      ]} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as Incident["severity"] })} />
      <Input id="location" label="Location" placeholder="e.g., FM 60 near Snook" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Description</label>
        <textarea className="w-full rounded-xl border border-border bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-maroon/30" rows={3} placeholder="What happened?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <Input id="notes" label="Additional Notes" placeholder="Optional" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <Button type="submit" disabled={!form.description || !form.location}>
        <AlertTriangle className="h-4 w-4 mr-1" />
        Report Incident
      </Button>
    </form>
  );
}
