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
import { UserPlus, X, Banknote } from "lucide-react";
import type { RideSlot, BookingFormData } from "@/lib/types";

interface BookingFormProps {
  slot: RideSlot;
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}

export function BookingForm({ slot, onSubmit, onCancel, loading, defaultName, defaultEmail, defaultPhone }: BookingFormProps) {
  const [form, setForm] = useState<BookingFormData>({
    name: defaultName || "",
    email: defaultEmail || "",
    phone: defaultPhone || "",
    num_passengers: 1,
    agreed_to_waiver: false,
    friends: [],
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showWaiver, setShowWaiver] = useState(false);

  const maxPassengers = spotsRemaining(slot.capacity, slot.booked_count);
  const totalPrice = slot.price_cents * form.num_passengers;

  function addFriend() {
    if (form.friends.length < form.num_passengers - 1) {
      setForm({
        ...form,
        friends: [...form.friends, { name: "", email: "", phone: "" }],
      });
    }
  }

  function removeFriend(index: number) {
    setForm({
      ...form,
      friends: form.friends.filter((_, i) => i !== index),
    });
  }

  function updateFriend(index: number, field: string, value: string) {
    const updated = [...form.friends];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, friends: updated });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (form.name.length < 2) newErrors.name = "Name is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Valid email required";
    if (form.phone.replace(/\D/g, "").length < 10) newErrors.phone = "Valid phone required";
    if (form.num_passengers < 1 || form.num_passengers > maxPassengers) {
      newErrors.num_passengers = `1-${maxPassengers} passengers`;
    }
    if (!form.agreed_to_waiver) newErrors.agreed_to_waiver = "You must agree to the waiver";

    // Validate friends
    form.friends.forEach((f, i) => {
      if (!f.name.trim()) newErrors[`friend_${i}_name`] = "Friend name required";
    });

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

  const canAddFriend = form.friends.length < form.num_passengers - 1;

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
              placeholder="Your full name"
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
              label="Total Passengers (including you)"
              options={passengerOptions}
              value={String(form.num_passengers)}
              onChange={(e) => {
                const num = parseInt(e.target.value);
                setForm({
                  ...form,
                  num_passengers: num,
                  friends: form.friends.slice(0, Math.max(0, num - 1)),
                });
              }}
              error={errors.num_passengers}
            />

            {/* Friends section */}
            {form.num_passengers > 1 && (
              <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Add your friends
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {form.friends.length}/{form.num_passengers - 1} added
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Friends with an account can see this ride on their dashboard. Email is optional but recommended.
                </p>

                {form.friends.map((friend, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 relative">
                    <button
                      type="button"
                      onClick={() => removeFriend(i)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <Input
                      id={`friend-${i}-name`}
                      label={`Friend ${i + 1} Name`}
                      placeholder="Friend's name"
                      value={friend.name}
                      onChange={(e) => updateFriend(i, "name", e.target.value)}
                      error={errors[`friend_${i}_name`]}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        id={`friend-${i}-email`}
                        label="Email (optional)"
                        type="email"
                        placeholder="friend@tamu.edu"
                        value={friend.email || ""}
                        onChange={(e) => updateFriend(i, "email", e.target.value)}
                      />
                      <Input
                        id={`friend-${i}-phone`}
                        label="Phone (optional)"
                        type="tel"
                        placeholder="(979) 555-0000"
                        value={friend.phone || ""}
                        onChange={(e) => updateFriend(i, "phone", e.target.value)}
                      />
                    </div>
                  </div>
                ))}

                {canAddFriend && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={addFriend}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Friend
                  </Button>
                )}
              </div>
            )}

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

            {/* In-person payment notice */}
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <Banknote className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Payment collected in person
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Bring <strong>cash or tap-to-pay</strong> for {formatCents(totalPrice)}. Your driver will collect payment at pickup.
                </p>
              </div>
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
                Pay in person with cash or tap when you arrive at pickup.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Booking..." : `Reserve ${form.num_passengers} Seat${form.num_passengers > 1 ? "s" : ""}`}
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
