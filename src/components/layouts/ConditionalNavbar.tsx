"use client";

import { useAuth } from "@/hooks/useAuth";
import { PublicNavbar } from "./navbar";
import { PrivateNavbar } from "./PrivateNavbar";

export function ConditionalNavbar() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while loading to prevent flash
  if (isLoading) {
    return null;
  }

  // Render appropriate navbar based on authentication status
  return isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />;
}