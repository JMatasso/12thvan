"use client";

import { motion } from "framer-motion";
import { CalendarCheck, CreditCard, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: CalendarCheck,
    title: "Pick Your Time",
    description:
      "Browse available rides to or from Chilifest. See real-time availability and pick the slot that works.",
    step: "01",
  },
  {
    icon: CreditCard,
    title: "Pay $30",
    description:
      "Secure your spot instantly with a card. $30 one-way, $60 round-trip. No surge, no surprises.",
    step: "02",
  },
  {
    icon: MessageCircle,
    title: "Get a Text",
    description:
      "You'll get an SMS confirmation and a reminder 30 minutes before departure. Show up and hop in.",
    step: "03",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-maroon">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Three steps. That&apos;s it.
          </h2>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              className="relative flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-maroon/10">
                  <step.icon className="h-7 w-7 text-maroon" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-maroon-dark">
                  {step.step}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
