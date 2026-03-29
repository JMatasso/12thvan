import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="12th Van"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-cover border-2 border-maroon-dark"
            />
            <span className="font-bold text-foreground">{SITE_NAME}</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/book" className="hover:text-foreground transition-colors">
              Book a Ride
            </Link>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
            <Link href="/waiver" className="hover:text-foreground transition-colors">
              Liability Waiver
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Driver Login
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>
            {SITE_NAME} is a peer-to-peer, informal cost-sharing arrangement. We are
            not a licensed Transportation Network Company (TNC), taxi service, or
            commercial carrier. By using this service, you agree to our{" "}
            <Link href="/waiver" className="underline hover:text-foreground">
              liability waiver
            </Link>
            .
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Gig &apos;em.
          </p>
        </div>
      </div>
    </footer>
  );
}
