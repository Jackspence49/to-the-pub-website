import { PrivateRoute } from "@/components/dashboard/PrivateRoute"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PrivateRoute>
      {children}
    </PrivateRoute>
  )
}