import { Button } from "./ui/button";
import Link from "next/link";
import "../app/globals.css";

export function Navbar() {
    return (
      <div>
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-white">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
                <Link href="/">
                    <img src="/ToThePub-logo.png" alt="To The Pub" className="h-30 w-auto" />
                </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/the-app" className="text-sm font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors">
                The App
              </Link>
              <Link href="/the-business" className="text-sm font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors">
                For Businesses
              </Link>
              <Link href="/about" className="text-sm font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/business-login">
                <Button className="bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90 text-white">Business Login</Button>
              </Link>
              <Link href="/business-signup">
                <Button variant="outline" className="hidden md:flex border-[var(--vibrant-teal)] text-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/10">Business Signup</Button>
              </Link>
            </div>
          </div>
        </header>
      </div>
    );
}