"use client";

import { motion } from "framer-motion";
import { Shield, Beer, Clock, Users } from "lucide-react";

const stats = [
  { icon: Shield, label: "Sober Drivers", value: "Always" },
  { icon: Beer, label: "DWIs Prevented", value: "∞" },
  { icon: Clock, label: "Ride Time", value: "15 min" },
  { icon: Users, label: "By Aggies, For Aggies", value: "Gig 'em" },
];

export function Trust() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-maroon">
            Why 12th Van
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Get there safe. Get back safe.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            We&apos;re a group of Aggies who got tired of seeing DWI arrests
            every Chilifest. So we&apos;re doing something about it.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-maroon/10">
                <stat.icon className="h-6 w-6 text-maroon" />
              </div>
              <p className="mt-4 text-2xl font-black text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
