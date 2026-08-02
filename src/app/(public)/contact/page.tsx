"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/common/section-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send, Loader2, AlertTriangle } from "lucide-react";
import { contactMessageSchema } from "@/lib/validations/contact";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  subject: "Room Booking Inquiry",
  message: "",
};

const subjectOptions = [
  "Room Booking Inquiry",
  "Restaurant & Catering",
  "Private Event / Wedding",
  "Other Services",
];

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [banner, setBanner] = useState("");

  const setValue = (field: keyof typeof initialValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setBanner("");

    const parsed = contactMessageSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors);
      setStatus("error");
      setBanner("Please correct the highlighted fields before sending.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (res.status === 501) {
        setStatus("success");
        setBanner(
          "Thank you! Online messaging goes live very soon — our concierge desk remains available 24/7 by phone.",
        );
        return;
      }

      if (res.ok) {
        setStatus("success");
        setBanner("Thank you! Your message has been received and our team will respond shortly.");
        setValues(initialValues);
        return;
      }

      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setBanner(body?.error || "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setBanner("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container-page py-24 space-y-12">
      <SectionHeader
        tag="Guest Concierge"
        title="Contact & Location"
        description="Our concierge desk is available 24 hours a day to assist with room reservations, private event inquiries, and special requests."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>We typically respond within 15 minutes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Your Full Name</Label>
                  <Input
                    id="contact-name"
                    name="name"
                    value={values.name}
                    onChange={setValue("name")}
                    placeholder="John Doe"
                    aria-invalid={Boolean(fieldErrors.name)}
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email Address</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={setValue("email")}
                    placeholder="john@example.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone">Phone (optional)</Label>
                <Input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={setValue("phone")}
                  placeholder="+234 ..."
                  aria-invalid={Boolean(fieldErrors.phone)}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-subject">Inquiry Type</Label>
                <select
                  id="contact-subject"
                  name="subject"
                  value={values.subject}
                  onChange={setValue("subject")}
                  className="flex h-11 w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/60"
                >
                  {subjectOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {fieldErrors.subject && (
                  <p className="text-xs text-destructive">{fieldErrors.subject[0]}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={values.message}
                  onChange={setValue("message")}
                  placeholder="How can we assist you today?"
                  aria-invalid={Boolean(fieldErrors.message)}
                />
                {fieldErrors.message && (
                  <p className="text-xs text-destructive">{fieldErrors.message[0]}</p>
                )}
              </div>

              {status !== "idle" && banner && (
                <div
                  role={status === "error" ? "alert" : "status"}
                  className={`flex items-start gap-2 rounded-md px-4 py-3 text-sm ${
                    status === "error"
                      ? "border border-destructive/40 bg-destructive/10 text-destructive"
                      : "border border-gold/40 bg-gold/10 text-foreground"
                  }`}
                >
                  {status === "error" && <AlertTriangle className="h-4 w-4 shrink-0" />}
                  <span>{banner}</span>
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={status === "submitting"}>
                {status === "submitting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Inquiry
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location & Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">Hotel Address</div>
                  <div>12 Kings Avenue, Victoria Island, Lagos, Nigeria</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">Direct Desk & Reservations</div>
                  <div>+234 (0) 800 KINGS HOTEL</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">Email Inquiries</div>
                  <div>reservations@thekingshotel.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground">Concierge Desk Hours</div>
                  <div>24/7 Front Desk Operations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
