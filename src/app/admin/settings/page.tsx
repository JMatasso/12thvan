"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Save } from "lucide-react";
import { useConfig } from "@/lib/data-store";

export default function AdminSettingsPage() {
  const { config, saveConfig } = useConfig();
  const [form, setForm] = useState(config);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveConfig(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure 12th Van for the event</p>
        </div>
        <Button onClick={handleSave}>
          {saved ? <Check className="h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          {saved ? "Saved!" : "Save All"}
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-6 max-w-2xl">
        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              id="one-way"
              label="One-Way Price ($)"
              type="number"
              value={form.price_one_way}
              onChange={(e) => setForm({ ...form, price_one_way: Number(e.target.value) })}
            />
            <Input
              id="round-trip"
              label="Round-Trip Price ($)"
              type="number"
              value={form.price_round_trip}
              onChange={(e) => setForm({ ...form, price_round_trip: Number(e.target.value) })}
            />
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pickup Locations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              id="pickup-cstat"
              label="College Station Pickup"
              value={form.pickup_cstat}
              onChange={(e) => setForm({ ...form, pickup_cstat: e.target.value })}
            />
            <Input
              id="pickup-snook"
              label="Snook Pickup"
              value={form.pickup_snook}
              onChange={(e) => setForm({ ...form, pickup_snook: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Operating hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Operations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="hours-start"
                label="Service Start Time"
                type="time"
                value={form.operating_hours_start}
                onChange={(e) => setForm({ ...form, operating_hours_start: e.target.value })}
              />
              <Input
                id="hours-end"
                label="Service End Time"
                type="time"
                value={form.operating_hours_end}
                onChange={(e) => setForm({ ...form, operating_hours_end: e.target.value })}
              />
            </div>
            <Input
              id="max-hours"
              label="Max Driver Hours (per day)"
              type="number"
              value={form.max_hours_per_driver}
              onChange={(e) => setForm({ ...form, max_hours_per_driver: Number(e.target.value) })}
            />
          </CardContent>
        </Card>

        {/* Integrations status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Integration Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[
              { name: "Supabase", env: "NEXT_PUBLIC_SUPABASE_URL" },
              { name: "Stripe", env: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" },
              { name: "Twilio (SMS)", env: "TWILIO_ACCOUNT_SID" },
            ].map((integration) => (
              <div key={integration.name} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <span className="text-sm font-medium">{integration.name}</span>
                <Badge variant="warning">Configure in .env.local</Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-2">
              Set integration keys in your <code className="bg-muted px-1 rounded">.env.local</code> file on the server.
              These cannot be changed from the UI for security reasons.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
