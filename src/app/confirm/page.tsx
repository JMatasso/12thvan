"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MapPin, Clock, Banknote } from "lucide-react";

function ConfirmContent() {
  return (
    <div className="mx-auto max-w-lg px-4">
      <Card className="text-center p-8">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            You&apos;re booked!
          </h1>

          <p className="text-muted-foreground">
            Your ride to Chilifest is confirmed. Check your email for the full details.
          </p>

          <div className="w-full rounded-xl bg-amber-50 border border-amber-200 p-4 text-left">
            <div className="flex items-start gap-2">
              <Banknote className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Payment is in person</p>
                <p className="text-sm text-amber-700 mt-1">
                  Bring <strong>cash or tap-to-pay</strong>. Your driver will collect payment at the pickup location.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl bg-muted p-4 text-left">
            <h3 className="font-semibold text-foreground mb-3">What happens next:</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-maroon flex-shrink-0" />
                You&apos;ll get an email confirmation with your ride details
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-maroon flex-shrink-0" />
                Show up at the pickup location 5 minutes early
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-maroon flex-shrink-0" />
                Have your confirmation email ready to show the driver
              </li>
            </ul>
          </div>

          <div className="flex gap-3 w-full mt-2">
            <Link href="/book" className="flex-1">
              <Button variant="secondary" className="w-full">
                Book Another Ride
              </Button>
            </Link>
            <Link href="/my-rides" className="flex-1">
              <Button className="w-full">My Rides</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center pt-24 pb-16">
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
          <ConfirmContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
