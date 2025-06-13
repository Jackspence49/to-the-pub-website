import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calendar,
    Clock,
    MapPin,
    Search
  } from "lucide-react"

export default function About() {
    return (
        <section id="for-users" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge className="inline-flex bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90">For Users</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Discover Events That Match Your Vibe
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Whether you're a Social Experience Seeker or an Event-Driven Socializer, To The Pub helps you find
                  exactly what you're looking for.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[var(--vibrant-teal)]/10 p-2">
                    <Search className="h-5 w-5 text-[var(--vibrant-teal)]" />
                  </div>
                  <div>
                    <h3 className="font-bold">Event-Centric Search</h3>
                    <p className="text-muted-foreground">
                      Find specific events like live jazz, trivia nights, or happy hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[var(--vibrant-teal)]/10 p-2">
                    <MapPin className="h-5 w-5 text-[var(--vibrant-teal)]" />
                  </div>
                  <div>
                    <h3 className="font-bold">Location-Based Discovery</h3>
                    <p className="text-muted-foreground">Find venues and events near you, wherever you are</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-[var(--vibrant-teal)]/10 p-2">
                    <Calendar className="h-5 w-5 text-[var(--vibrant-teal)]" />
                  </div>
                  <div>
                    <h3 className="font-bold">Real-Time Updates</h3>
                    <p className="text-muted-foreground">See what's happening tonight or plan for the weekend</p>
                  </div>
                </div>
              </div>
              <div>
                <Button className="bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90 text-white">Download App</Button>
              </div>
            </div>
            <div className="mx-auto flex items-center justify-center">
              <Tabs defaultValue="events" className="w-full max-w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="venues">Venues</TabsTrigger>
                </TabsList>
                <TabsContent value="events" className="mt-4 space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">Live Jazz Night</h4>
                        <p className="text-sm text-muted-foreground">The Blue Note</p>
                      </div>
                      <Badge className="bg-[var(--goldenrod)] text-[var(--dark-sapphire)] hover:bg-[var(--goldenrod)]/90">Tonight</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>8:00 PM - 11:00 PM</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="border-[var(--vibrant-teal)] text-[var(--vibrant-teal)]">
                        Live Music
                      </Badge>
                      <Badge variant="outline" className="border-[var(--vibrant-teal)] text-[var(--vibrant-teal)]">
                        Jazz
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">Trivia Night</h4>
                        <p className="text-sm text-muted-foreground">The Local Tavern</p>
                      </div>
                      <Badge className="bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90">Tomorrow</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>7:00 PM - 9:00 PM</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="border-[var(--vibrant-teal)] text-[var(--vibrant-teal)]">
                        Game Night
                      </Badge>
                      <Badge variant="outline" className="border-[var(--vibrant-teal)] text-[var(--vibrant-teal)]">
                        Trivia
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="venues" className="mt-4 space-y-4">
                  <div className="rounded-lg border p-4">
                    <div>
                      <h4 className="font-bold">The Speakeasy</h4>
                      <p className="text-sm text-muted-foreground">Cocktail Lounge</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>0.5 miles away</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="border-[var(--vibrant-teal)] text-[var(--vibrant-teal)]">
                        Craft Cocktails
                      </Badge>
                      <Badge variant="outline" className="border-[var(--vibrant-teal)] text-[var(--vibrant-teal)]">
                        Live Piano
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div>
                      <h4 className="font-bold">Hopworks Brewery</h4>
                      <p className="text-sm text-muted-foreground">Brewery</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>1.2 miles away</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="border-[var(--vibrant-teal)] text-[var(--vibrant-teal)]">
                        Craft Beer
                      </Badge>
                      <Badge variant="outline" className="border-[var(--vibrant-teal)] text-[var(--vibrant-teal)]">
                        Food Menu
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    )
}