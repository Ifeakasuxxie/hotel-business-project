"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainNavLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isTransparent = isHomepage && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isTransparent
          ? "bg-transparent"
          : "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300",
            isTransparent
              ? "bg-gold/20 text-gold"
              : "bg-gold text-white"
          )}>
            <Hotel className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-serif text-lg font-bold tracking-wider transition-colors",
              isTransparent ? "text-white" : "text-foreground"
            )}>
              THE KINGS HOTEL
            </span>
            <span className={cn(
              "text-[10px] font-medium tracking-widest uppercase transition-colors",
              isTransparent ? "text-gold/80" : "text-gold"
            )}>
              Luxury & Comfort
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center space-x-1">
          {mainNavLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isTransparent
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:flex items-center">
          <Button asChild size="sm">
            <Link href="/book">Book Now</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={cn(
            "lg:hidden p-2 focus:outline-none transition-colors",
            isTransparent ? "text-white hover:text-gold" : "text-foreground hover:text-gold"
          )}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-b border-border px-4 pt-2 pb-6">
          <div className="space-y-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-foreground hover:bg-secondary"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border">
            <Button asChild className="w-full justify-center">
              <Link href="/book" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
