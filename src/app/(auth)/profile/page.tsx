"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, Mail, Save, ShieldCheck } from "lucide-react";

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  emailVerified: boolean;
  role?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/profile");
        const body = (await res.json()) as { success: boolean; data?: Profile; error?: string };
        if (!body.success) {
          if (!cancelled) setError(body.error ?? "Failed to load profile");
          return;
        }
        if (cancelled || !body.data) return;
        setProfile(body.data);
        setFirstName(body.data.firstName);
        setLastName(body.data.lastName);
        setPhone(body.data.phone ?? "");
      } catch {
        if (!cancelled) setError("Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone: phone || null }),
      });
      const body = (await res.json()) as { success: boolean; data?: Profile; error?: string };

      if (!body.success) {
        setError(body.error ?? "Unable to update profile");
        return;
      }

      setSaved(true);
      if (body.data) setProfile(body.data);
      router.refresh();
    } catch {
      setError("Unable to update profile");
    } finally {
      setSaving(false);
    }
  }

  const roleLabel =
    profile?.role === "ADMIN" || profile?.role === "MANAGER"
      ? "Administrator"
      : profile?.role === "STAFF" || profile?.role === "CONCIERGE"
        ? "Hotel Staff"
        : "Member";

  return (
    <div className="container-page py-24 sm:py-28">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-tag">Your Account</div>
            <h1 className="heading-serif text-3xl sm:text-4xl text-foreground mt-2">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your personal details and preferences.
            </p>
          </div>
          {profile && (
            <Badge variant="gold" className="gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> {roleLabel}
            </Badge>
          )}
        </div>

        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading profile...
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card>
            <CardContent className="py-8">
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/login")}>
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        )}

        {!loading && !error && profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Personal Details</CardTitle>
              <CardDescription>These details are used across your bookings and reservations.</CardDescription>
            </CardHeader>
            <CardContent>
              {saved && (
                <div className="mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  Profile updated successfully.
                </div>
              )}
              {error && (
                <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={profile.email} disabled className="pl-9 opacity-70" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your email address cannot be changed.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                  <Button type="submit" variant="gold" className="gap-2" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="gap-2"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
