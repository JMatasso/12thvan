"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "register") {
      if (name.length < 2) {
        setError("Name must be at least 2 characters");
        setLoading(false);
        return;
      }

      const result = await register(name, email, password, phone);
      if (result.success) {
        // Auto-login after registration
        const loginResult = await login(email, password);
        if (loginResult.success) {
          router.push("/my-rides");
          return;
        }
        setSuccess("Account created! You can now log in.");
        setMode("login");
      } else {
        setError(result.error || "Registration failed");
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        router.push("/my-rides");
        return;
      } else {
        setError(result.error || "Invalid email or password");
      }
    }

    setLoading(false);
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center pt-24 pb-16 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-maroon text-white font-black text-lg">
              12
            </div>
            <CardTitle className="mt-4">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Log in to view and manage your rides"
                : "Sign up to book rides to Chilifest"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "register" && (
                <Input
                  id="name"
                  label="Full Name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="howdy@tamu.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {mode === "register" && (
                <Input
                  id="phone"
                  label="Phone (optional)"
                  type="tel"
                  placeholder="(979) 555-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="text-sm text-danger">{error}</p>}
              {success && <p className="text-sm text-success">{success}</p>}

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading
                  ? (mode === "login" ? "Signing in..." : "Creating account...")
                  : (mode === "login" ? "Sign In" : "Create Account")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
                      className="font-medium text-maroon underline hover:text-maroon-dark"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                      className="font-medium text-maroon underline hover:text-maroon-dark"
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
