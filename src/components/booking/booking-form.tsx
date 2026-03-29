"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatCents, formatTime, formatDate, spotsRemaining } from "@/lib/utils";
import { LIABILITY_WAIVER } from "@/lib/constants";
import type { RideSlot, BookingFormData } from "@/lib/types";

interface BookingFormProps {
  slot: RideSlot;
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function BookingForm({ slot, onSubmit, onCancel, loading }: BookingFormProps) {
  const [form, setForm] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    num_passengers: 1,
    agreed_to_waiver: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [showWaiver, setShowWaiver] = useState(false);

  const maxPassengers = spotsRemaining(slot.capacity, slot.booked_count);
  const totalPrice = slot.price_cents * form.num_passengers;

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (form.name.length < 2) newErrors.name = "Name is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Valid email required";
    if (form.phone.replace(/\D/g, "").length < 10) newErrors.phone = "Valid phone required";
    if (form.num_passengers < 1 || form.num_passengers > maxPassengers) {
      newErrors.num_passengers = `1-${maxPassengers} passengers`;
    }
    if (!form.agreed_to_waiver) newErrors.agreed_to_waiver = "You must agree to the waiver";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(form);
  }

  const passengerOptions = Array.from({ length: maxPassengers }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? "passenger" : "passengers"}`,
  }));

  return (
    <>
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Booking</CardTitle>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>{formatDate(slot.departure_time)}</span>
            <span>•</span>
            <span>{formatTime(slot.departure_time)}</span>
            <span>•</span>
            <span>{slot.direction === "to_snook" ? "To Chilifest" : "To College Station"}</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="name"
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="howdy@tamu.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Input
              id="phone"
              label="Phone"
              type="tel"
              placeholder="(979) 555-1234"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
            />
            <Select
              id="passengers"
              label="Number of Passengers"
              options={passengerOptions}
              value={String(form.num_passengers)}
              onChange={(e) =>
                setForm({ ...form, num_passengers: parseInt(e.target.value) })
              }
              error={errors.num_passengers}
            />

            {/* Waiver checkbox */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreed_to_waiver}
                  onChange={(e) =>
                    setForm({ ...form, agreed_to_waiver: e.target.checked })
                  }
                  className="mt-1 h-4 w-4 rounded border-border accent-maroon"
                />
                <span className="text-sm text-muted-foreground">
                  I have read and agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowWaiver(true)}
                    className="font-medium text-maroon underline hover:text-maroon-dark"
                  >
                    Liability Waiver & Disclaimer
                  </button>
                  . I understand that 12th Van is an informal, peer-to-peer
                  cost-sharing arrangement and not a licensed transportation
                  service.
                </span>
              </label>
              {errors.agreed_to_waiver && (
                <p className="text-sm text-danger">{errors.agreed_to_waiver}</p>
              )}
            </div>

            {/* Price summary */}
            <div className="flex items-center justify-between rounded-xl bg-maroon/5 p-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {form.num_passengers} × {formatCents(slot.price_cents)}
                </p>
                <p className="text-2xl font-black text-foreground">
                  {formatCents(totalPrice)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground max-w-[150px] text-right">
                Secure payment via Stripe. Your card info never touches our servers.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Processing..." : `Pay ${formatCents(totalPrice)}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Waiver modal */}
      <Dialog open={showWaiver} onOpenChange={setShowWaiver}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Liability Waiver & Disclaimer</DialogTitle>
            <DialogDescription>Please read carefully before booking.</DialogDescription>
          </DialogHeader>
          <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {LIABILITY_WAIVER}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
