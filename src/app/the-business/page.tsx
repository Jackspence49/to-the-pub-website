import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, Star, ArrowRight } from "lucide-react"

export default function TheBusiness() {
    return (
        <section id="for-businesses" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[400px_1fr] lg:gap-12 xl:grid-cols-[600px_1fr]">
            <div className="mx-auto flex items-center justify-center">
              <div className="space-y-6">
                <div className="rounded-lg border p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-[var(--vibrant-teal)]/10 p-3">
                      <Users className="h-6 w-6 text-[var(--vibrant-teal)]" />
                    </div>
                    <div>
                      <h3 className="font-bold">Reach New Customers</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with users actively looking for your type of venue
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-[var(--vibrant-teal)]/10 p-3">
                      <Calendar className="h-6 w-6 text-[var(--vibrant-teal)]" />
                    </div>
                    <div>
                      <h3 className="font-bold">Promote Your Events</h3>
                      <p className="text-sm text-muted-foreground">
                        Showcase your events to users searching for specific experiences
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-[var(--vibrant-teal)]/10 p-3">
                      <Star className="h-6 w-6 text-[var(--vibrant-teal)]" />
                    </div>
                    <div>
                      <h3 className="font-bold">Highlight Your Unique Atmosphere</h3>
                      <p className="text-sm text-muted-foreground">
                        Stand out with our detailed venue categorization system
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge className="inline-flex bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90">For Businesses</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Grow Your Business With To The Pub
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Connect with customers looking for exactly what your venue offers. Our platform helps you showcase
                  your events and unique atmosphere.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground">With our Venue Event Input Portal, you can:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-[var(--vibrant-teal)]" />
                    <span>Manage your venue profile and atmosphere categorization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-[var(--vibrant-teal)]" />
                    <span>Add and update events in real-time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-[var(--vibrant-teal)]" />
                    <span>Access basic analytics about user interest</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-[var(--vibrant-teal)]" />
                    <span>Tag events with specific categories to reach interested users</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
}