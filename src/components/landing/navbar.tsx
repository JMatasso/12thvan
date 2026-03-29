"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#schedule", label: "Schedule" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, isDriver, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <nav className="fixed top-0 z-40 w-full border-b border-white/10 bg-maroon-dark/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-maroon-dark font-black text-sm">
            12
          </div>
          <span className="text-lg font-bold text-white">{SITE_NAME}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-gold hover:text-gold hover:bg-gold/10">
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
              {isDriver && (
                <Link href="/driver">
                  <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                    Driver View
                  </Button>
                </Link>
              )}
              <Link href="/my-rides">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  My Rides
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                Log In
              </Button>
            </Link>
          )}
          <Link href="/book">
            <Button variant="gold" size="sm">
              Book Now
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 bg-maroon-dark",
          mobileOpen ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <div className="flex flex-col gap-1 px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full text-gold hover:text-gold hover:bg-gold/10">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin Portal
                    </Button>
                  </Link>
                )}
                {isDriver && (
                  <Link href="/driver" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">
                      Driver View
                    </Button>
                  </Link>
                )}
                <Link href="/my-rides" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">
                    My Rides
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-white/50 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10">
                  Log In
                </Button>
              </Link>
            )}
            <Link href="/book" onClick={() => setMobileOpen(false)}>
              <Button variant="gold" className="w-full">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
