"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MessageCircle, MapPin, Clock } from "lucide-react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

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
            Your ride to Chilifest is confirmed. Gig &apos;em!
          </p>

          <div className="w-full rounded-xl bg-muted p-4 text-left">
            <h3 className="font-semibold text-foreground mb-3">What happens next:</h3>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 text-maroon flex-shrink-0" />
                You&apos;ll get an SMS with your ride details and driver info
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-maroon flex-shrink-0" />
                30 minutes before departure, you&apos;ll get a reminder text
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-maroon flex-shrink-0" />
                Show up at the pickup location 5 minutes early
              </li>
            </ul>
          </div>

          {sessionId && (
            <p className="text-xs text-muted-foreground">
              Confirmation: {sessionId.slice(0, 20)}...
            </p>
          )}

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
