"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-store";
import { Check, Shield, Car, User } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, updateProfile, changePassword } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
    }
  }, [user, loading, router]);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    const result = changePassword(currentPassword, newPassword);
    if (!result.success) {
      setPasswordError(result.error || "Failed to change password");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  }

  if (loading || !user) return null;

  const roleIcon = user.role === "admin" ? Shield : user.role === "driver" ? Car : User;
  const RoleIcon = roleIcon;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-foreground">My Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your profile and account settings
          </p>

          {/* Profile info */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                <Input
                  id="name"
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
                <Input
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(979) 555-1234"
                />
                <Button type="submit" className="self-start">
                  {saved ? (
                    <><Check className="h-4 w-4 mr-1" />Saved!</>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your login password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <Input
                  id="current-password"
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••"
                />
                <Input
                  id="new-password"
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
                <Input
                  id="confirm-password"
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                />
                {passwordError && (
                  <p className="text-sm text-danger">{passwordError}</p>
                )}
                <Button type="submit" variant="secondary" className="self-start">
                  {passwordSaved ? (
                    <><Check className="h-4 w-4 mr-1" />Password Updated!</>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID</span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium">{user.role}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
