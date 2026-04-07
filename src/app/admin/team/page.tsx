"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Shield, Car, User } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/lib/types";

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | UserRole>("all");

  async function fetchUsers() {
    const { data } = await supabase.from("users").select("*").order("created_at");
    if (data) {
      setUsers(data.map((u) => ({
        id: u.id,
        auth_id: u.auth_id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role as UserRole,
        photo_url: u.photo_url,
        bio: u.bio,
      })));
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleRemove(userId: string) {
    if (userId === currentUser?.id) return;
    if (!confirm("Remove this user? They will no longer be able to access the system.")) return;
    await supabase.from("users").delete().eq("id", userId);
    fetchUsers();
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    if (userId === currentUser?.id) return;
    await supabase.from("users").update({ role: newRole }).eq("id", userId);
    fetchUsers();
  }

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);
  const adminCount = users.filter((u) => u.role === "admin").length;
  const driverCount = users.filter((u) => u.role === "driver").length;
  const riderCount = users.filter((u) => u.role === "rider").length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team & Admins</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {adminCount} admins • {driverCount} drivers • {riderCount} riders
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Person
        </Button>
      </div>

      <div className="mt-6 flex gap-2">
        {(["all", "admin", "driver", "rider"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              filter === f ? "bg-maroon text-white" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {filtered.map((u) => {
          const isCurrentUser = u.id === currentUser?.id;
          const roleIcon = u.role === "admin" ? Shield : u.role === "driver" ? Car : User;
          const RoleIcon = roleIcon;

          return (
            <Card key={u.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon/10 overflow-hidden flex-shrink-0">
                    {u.photo_url ? (
                      <img src={u.photo_url} alt={u.name} className="h-full w-full object-cover" />
                    ) : (
                      <RoleIcon className="h-5 w-5 text-maroon" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{u.name}</p>
                      {isCurrentUser && (
                        <Badge variant="default" className="text-[10px]">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    options={[
                      { value: "admin", label: "Admin" },
                      { value: "driver", label: "Driver" },
                      { value: "rider", label: "Rider" },
                    ]}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    disabled={isCurrentUser}
                    className="w-28 h-9 text-sm"
                  />
                  {!isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(u.id)}
                      className="text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <AddPersonForm onAdded={() => { fetchUsers(); setShowAdd(false); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddPersonForm({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin" as UserRole,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          password: form.password,
          role: form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }
    } catch {
      setError("Failed to create account");
      setLoading(false);
      return;
    }

    setLoading(false);
    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <Input id="name" label="Name" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input id="email" label="Email" type="email" placeholder="user@12thvan.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <Input id="phone" label="Phone" type="tel" placeholder="(979) 555-1234" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <Input id="password" label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <Select
        id="role"
        label="Role"
        options={[
          { value: "admin", label: "Admin — Full access to everything" },
          { value: "driver", label: "Driver — Can see assigned rides and passengers" },
          { value: "rider", label: "Rider — Can book rides" },
        ]}
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add to Team"}</Button>
    </form>
  );
}
