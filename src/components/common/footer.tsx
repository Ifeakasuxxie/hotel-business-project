import Link from "next/link";
import { Hotel, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy text-white/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <Hotel className="h-5 w-5 text-gold" />
              </div>
              <span className="font-serif text-lg font-bold text-white">
                THE KINGS HOTEL
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50">
              Experience refined hospitality where every detail is crafted with care.
              Your comfort and satisfaction are our highest priority.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-white/5 text-white/40 hover:bg-gold/20 hover:text-gold transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 text-white/40 hover:bg-gold/20 hover:text-gold transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 text-white/40 hover:bg-gold/20 hover:text-gold transition-colors" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link href="/rooms" className="hover:text-gold transition-colors">Rooms & Suites</Link></li>
              <li><Link href="/services" className="hover:text-gold transition-colors">Services</Link></li>
              <li><Link href="/testimonials" className="hover:text-gold transition-colors">Testimonials</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              The Experience
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/experience" className="hover:text-gold transition-colors">Overview</Link></li>
              <li><Link href="/rooms" className="hover:text-gold transition-colors">Accommodation</Link></li>
              <li><Link href="/services#dining" className="hover:text-gold transition-colors">Dining</Link></li>
              <li><Link href="/services#recreation" className="hover:text-gold transition-colors">Recreation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Policies
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">Cancellation Policy</Link></li>
              <li><Link href="#" className="hover:text-gold transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} The Kings Hotel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
