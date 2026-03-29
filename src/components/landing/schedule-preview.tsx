"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const sampleSlots = [
  {
    id: "1",
    direction: "to_snook" as const,
    time: "2:00 PM",
    date: "Fri, Apr 10",
    from: "Post Oak Mall",
    to: "Chilifest Grounds",
    spotsLeft: 4,
    total: 5,
  },
  {
    id: "2",
    direction: "to_snook" as const,
    time: "4:00 PM",
    date: "Fri, Apr 10",
    from: "Post Oak Mall",
    to: "Chilifest Grounds",
    spotsLeft: 2,
    total: 5,
  },
  {
    id: "3",
    direction: "to_cstat" as const,
    time: "11:00 PM",
    date: "Fri, Apr 10",
    from: "Chilifest Grounds",
    to: "Post Oak Mall",
    spotsLeft: 6,
    total: 12,
  },
  {
    id: "4",
    direction: "to_snook" as const,
    time: "12:00 PM",
    date: "Sat, Apr 11",
    from: "Post Oak Mall",
    to: "Chilifest Grounds",
    spotsLeft: 0,
    total: 5,
  },
];

function SpotIndicator({ spotsLeft, total }: { spotsLeft: number; total: number }) {
  const status = spotsLeft === 0 ? "full" : spotsLeft <= 2 ? "almost-full" : "open";
  return (
    <Badge
      variant={status === "full" ? "danger" : status === "almost-full" ? "warning" : "success"}
    >
      {status === "full" ? "Full" : `${spotsLeft} spots left`}
    </Badge>
  );
}

export function SchedulePreview() {
  return (
    <section id="schedule" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-maroon">
            Schedule
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Upcoming Rides
          </h2>
          <p className="mt-4 text-muted-foreground">
            Rides run continuously on both days. Here&apos;s a preview.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {sampleSlots.map((slot, i) => (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={cn(
                  "flex flex-col gap-4 p-5 transition-all hover:shadow-md",
                  slot.spotsLeft === 0 && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-white text-xs font-bold",
                        slot.direction === "to_snook" ? "bg-maroon" : "bg-foreground"
                      )}
                    >
                      {slot.direction === "to_snook" ? "→S" : "→CS"}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{slot.date}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {slot.time}
                      </div>
                    </div>
                  </div>
                  <SpotIndicator spotsLeft={slot.spotsLeft} total={slot.total} />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    {slot.from} → {slot.to}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/book">
            <Button size="lg" className="group">
              See All Rides & Book
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
