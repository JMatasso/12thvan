"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-maroon-dark pt-16">
      {/* Background video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-maroon-dark/70" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm font-medium text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              Chilifest 2026 — April 10 & 11
            </span>
          </motion.div>

          <motion.h1
            className="mt-8 max-w-4xl text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Your ride to Chilifest.{" "}
            <span className="text-gold">$30.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-lg text-white/60 sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Skip the DWI. Skip the surge pricing. Book your seat from
            College Station to Snook in 30 seconds.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/book">
              <Button variant="gold" size="xl" className="group">
                Book Your Seat
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="xl" className="border-white/20 text-white hover:bg-white/10 hover:border-white/40">
                See How It Works
              </Button>
            </a>
          </motion.div>

          <motion.div
            className="mt-12 flex items-center gap-6 text-sm text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-success" />
              Sober drivers
            </span>
            <span className="h-4 w-px bg-white/20" />
            <span>Run by Aggies</span>
            <span className="h-4 w-px bg-white/20" />
            <span>15 min ride</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
