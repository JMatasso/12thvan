"use client";

import { MapPin, Clock, Users, Car } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatTime, formatDate, spotsRemaining, spotStatus, formatCents } from "@/lib/utils";
import type { RideSlot } from "@/lib/types";

interface RideSlotCardProps {
  slot: RideSlot;
  onSelect: (slot: RideSlot) => void;
}

export function RideSlotCard({ slot, onSelect }: RideSlotCardProps) {
  const remaining = spotsRemaining(slot.capacity, slot.booked_count);
  const status = spotStatus(slot.capacity, slot.booked_count);
  const isFull = status === "full";

  return (
    <Card
      className={cn(
        "flex flex-col gap-3 p-5 transition-all",
        isFull ? "opacity-50" : "hover:shadow-md hover:border-maroon/20"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl text-white text-xs font-bold",
              slot.direction === "to_snook" ? "bg-maroon" : "bg-foreground"
            )}
          >
            {slot.direction === "to_snook" ? "→ S" : "→ CS"}
          </div>
          <div>
            <p className="font-bold text-foreground">
              {formatDate(slot.departure_time)}
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(slot.departure_time)}
            </div>
          </div>
        </div>
        <Badge
          variant={
            status === "full" ? "danger" : status === "almost-full" ? "warning" : "success"
          }
        >
          {isFull ? "Full" : `${remaining} spots`}
        </Badge>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-success" />
          <span>{slot.pickup_location}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-danger" />
          <span>{slot.dropoff_location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {slot.capacity} seats
          </span>
          <span className="flex items-center gap-1">
            <Car className="h-3.5 w-3.5" />
            {slot.vehicle?.description || "Vehicle"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-foreground">
            {formatCents(slot.price_cents)}
          </span>
          <Button
            size="sm"
            disabled={isFull}
            onClick={() => onSelect(slot)}
          >
            {isFull ? "Full" : "Book"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
