import { PrivateRoute } from "@/components/auth/PrivateRoute"

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