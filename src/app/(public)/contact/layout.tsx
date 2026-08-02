import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Location",
  description:
    "Reach the 24/7 concierge desk at The Kings Hotel for room reservations, private events, and special requests.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
