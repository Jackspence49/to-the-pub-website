import { Button } from "@/components/ui/button"
import Link from "next/link"

function DashboardContent() {
  const dashboardActions = [
    {
      label: "Create New Business",
      href: "/dashboard/new-business",
      description: "Add a new business to the platform"
    },
    {
      label: "Create New User",
      href: "/dashboard/new-user", 
      description: "Create a new user account"
    },
    {
      label: "Create New Event",
      href: "/dashboard/new-event",
      description: "Create a new event"
    },
    {
      label: "Create a New Tags",
      href: "/dashboard/new-tags",
      description: "Add new tags to the system"
    },
    {
      label: "Edit Hours",
      href: "/dashboard/edit-hours",
      description: "Edit business operating hours"
    },
    {
      label: "Edit Tags",
      href: "/dashboard/edit-tags",
      description: "Edit bar tags"
    },
    {
      label: "Edit Bar Info",
      href: "/dashboard/edit-bar-info",
      description: "Edit bar information"
    },
    {
      label: "Edit Event",
      href: "/dashboard/edit-event",
      description: "Edit existing events"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Quick Actions</h2>
            <p className="text-foreground/80">Manage your business and events</p>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardActions.map((action, index) => (
            <Link key={index} href={action.href} className="group">
              <div className="bg-card-background border border-border-color rounded-lg p-6 h-full transition-all duration-200 hover:shadow-lg hover:scale-105 hover:border-accent/50">
                <Button 
                  variant="ghost" 
                  className="w-full h-auto p-0 flex flex-col items-center justify-center min-h-[120px] text-foreground hover:text-accent hover:bg-transparent"
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                      {action.label}
                    </div>
                    <div className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return <DashboardContent />
}
