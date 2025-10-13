import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - To The Pub",
  description: "Admin dashboard for managing businesses and events",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dashboard-container">
      {/* No navbar here - dashboard has its own layout */}
      {children}
    </div>
  );
}