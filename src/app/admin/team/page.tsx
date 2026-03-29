"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Shield, Car, User } from "lucide-react";
import { getAllUsers, addUserToDB, removeUserFromDB, updateUserInDB, type AuthUser } from "@/lib/auth-store";
import { useAuth } from "@/lib/auth-store";
import type { UserRole } from "@/lib/types";

export default function TeamPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<(AuthUser & { password?: string })[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | UserRole>("all");

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  function refreshUsers() {
    setUsers(getAllUsers());
  }

  function handleRemove(email: string) {
    if (email === currentUser?.email) return;
    if (!confirm(`Remove ${email}? They will no longer be able to log in.`)) return;
    removeUserFromDB(email);
    refreshUsers();
  }

  function handleRoleChange(email: string, newRole: UserRole) {
    if (email === currentUser?.email) return;
    updateUserInDB(email, { role: newRole });
    refreshUsers();
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

      {/* Filter tabs */}
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

      {/* Users list */}
      <div className="mt-6 flex flex-col gap-3">
        {filtered.map((u) => {
          const isCurrentUser = u.email === currentUser?.email;
          const roleIcon = u.role === "admin" ? Shield : u.role === "driver" ? Car : User;
          const RoleIcon = roleIcon;

          return (
            <Card key={u.email} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon/10">
                    <RoleIcon className="h-5 w-5 text-maroon" />
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
                    onChange={(e) => handleRoleChange(u.email, e.target.value as UserRole)}
                    disabled={isCurrentUser}
                    className="w-28 h-9 text-sm"
                  />
                  {!isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(u.email)}
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

      {/* Add person dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <AddPersonForm
            onAdded={() => { refreshUsers(); setShowAdd(false); }}
          />
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

  function handleSubmit(e: React.FormEvent) {
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

    const success = addUserToDB({
      id: `${form.role}-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      password: form.password,
    });

    if (!success) {
      setError("A user with this email already exists");
      return;
    }

    onAdded();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
      <Input id="name" label="Name" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <Input id="email" label="Email" type="email" placeholder="john@12thvan.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
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
      <Button type="submit">Add to Team</Button>
    </form>
  );
}
