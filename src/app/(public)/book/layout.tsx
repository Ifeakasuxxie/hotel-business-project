import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Stay",
  description:
    "Reserve your room at The Kings Hotel — select dates, guests, and preferences for a seamless stay.",
  alternates: {
    canonical: "/book",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
