"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on role — read from the auth store after login
      const stored = localStorage.getItem("12thvan_auth");
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "driver") router.push("/driver");
        else router.push("/my-rides");
      }
    } else {
      setError(result.error || "Invalid email or password");
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
            <CardTitle className="mt-4">Welcome back</CardTitle>
            <CardDescription>
              Log in to manage your rides or access the admin portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="howdy@tamu.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <p className="text-sm text-danger">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="mt-4 rounded-xl bg-muted p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Demo Accounts:</p>
                <p>Admin: admin@12thvan.com / admin123</p>
                <p>Driver: jake@12thvan.com / driver123</p>
                <p>New rider: any email / any 6+ char password</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
