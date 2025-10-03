"use client";

import { Button } from "./ui/button";
import Link from "next/link";
import "../app/globals.css";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && 
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div>
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-white">
          <div className="flex h-16 items-center justify-between md:container px-4">
            <div className="flex items-center gap-2">
                <Link href="/">
                    <img src="/ToThePub-logo.png" alt="To The Pub" className="h-40 w-auto" />
                </Link>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/the-app" className="text-medium font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors">
                The App
              </Link>
              <Link href="/the-business" className="text-medium font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors">
                For Businesses
              </Link>
              <Link href="/about" className="text-medium font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              {/* Desktop Business Login Button */}
              <Link href="/business-login" className="hidden md:block">
                <Button className="bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90 text-white">Business Login</Button>
              </Link>
              {/* Mobile Menu Button */}
              <button 
                ref={buttonRef}
                className="hamburger-button mr-[-1.5rem] md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-[var(--text-on-light)]" />
                ) : (
                  <Menu className="h-6 w-6 text-[var(--text-on-light)]" />
                )}
              </button>
            </div>
          </div>
          {/* Mobile Navigation Menu */}
          <div 
            ref={menuRef}
            className={`mobile-menu md:hidden absolute top-16 left-0 right-0 bg-white border-b transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <nav className="container py-4 space-y-4">
              <Link
                href="/the-app"
                className="block text-sm font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                The App
              </Link>
              <Link
                href="/the-business"
                className="block text-sm font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                For Businesses
              </Link>
              <Link
                href="/about"
                className="block text-sm font-medium text-[var(--text-on-light)] hover:text-[var(--vibrant-teal)] transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="flex flex-col items-center space-y-3 pt-2 py-4">
                <Link
                  href="/business-login"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="w-64 mx-auto">
                    <Button className="w-full bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90 text-white">
                      Business Login
                    </Button>
                  </div>
                </Link>
              </div>
            </nav>
          </div>
        </header>
      </div>
    );
}