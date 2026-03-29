"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "One-Way",
    price: "$30",
    description: "Single ride to or from Chilifest",
    features: [
      "Choose your departure time",
      "Guaranteed seat",
      "SMS confirmation",
      "Sober, insured driver",
    ],
    popular: false,
  },
  {
    name: "Round-Trip",
    price: "$60",
    description: "There and back — locked in",
    features: [
      "Everything in One-Way",
      "Return ride included",
      "Priority booking for return",
      "Best value",
    ],
    popular: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-maroon">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">
            Cheaper than surge. Safer than driving.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Split with friends and it&apos;s practically free.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <Card
                className={cn(
                  "relative flex flex-col p-8",
                  plan.popular && "border-maroon shadow-lg shadow-maroon/10"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-maroon px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6">
                  <span className="text-5xl font-black text-foreground">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-muted-foreground">/person</span>
                </div>
                <ul className="mt-8 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/book" className="mt-8">
                  <Button
                    variant={plan.popular ? "default" : "secondary"}
                    size="lg"
                    className="w-full group"
                  >
                    Book {plan.name}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
