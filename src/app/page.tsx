import Link from "next/link"
import "./globals.css";
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Compass,
  Filter,
  MapPin,
  Music,
  Search,
  Star,
  Users,
  Beer,
  Wine,
  CoffeeIcon as Cocktail,
  Mic,
  Gamepad2,
  ArrowRight,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[var(--dark-sapphire)] text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex bg-[var(--goldenrod)] text-[var(--dark-sapphire)] hover:bg-[var(--goldenrod)]/90">New App</Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Discover Your Perfect Night Out
                  </h1>
                  <p className="max-w-[600px] text-gray-200 md:text-xl">
                    Real-time event discovery, precise filtering, and bar atmosphere categorization to find exactly what
                    you're looking for tonight.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90 text-white">Download App</Button>
                  <Link href="/the-app">
                    <Button variant="outline" className="hidden md:flex border-[var(--vibrant-teal)] text-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/10" >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto flex items-center justify-center">
                <div className="relative h-[500px] w-[250px] overflow-hidden rounded-xl border-8 border-[var(--charcoal-gray)] shadow-xl">
                  <div className="absolute inset-0 bg-[var(--dark-sapphire)]">
                    <div className="flex h-full flex-col">
                      <div className="h-12 bg-[var(--charcoal-gray)] flex items-center justify-center">
                        <div className="h-4 w-20 rounded-full bg-[var(--light-gray)]"></div>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="mb-4 h-8 w-full rounded-md bg-[var(--vibrant-teal)]"></div>
                        <div className="space-y-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 rounded-lg bg-[var(--charcoal-gray)] p-3">
                              <div className="h-4 w-3/4 rounded-full bg-white mb-2"></div>
                              <div className="h-3 w-1/2 rounded-full bg-[var(--light-gray)]"></div>
                              <div className="mt-3 flex gap-2">
                                <div className="h-6 w-16 rounded-full bg-[var(--vibrant-teal)]"></div>
                                <div className="h-6 w-16 rounded-full bg-[var(--goldenrod)]"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90">Key Features</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-[var(--charcoal-gray)]">What Makes Us Different</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-[var(--charcoal-gray)]">
                  To The Pub is a hyper-focused nightlife discovery platform that helps you find exactly what you're
                  looking for.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="border-[var(--light-gray)] hover:border-[var(--vibrant-teal)] transition-colors text-[var(--charcoal-gray)]" >
                <CardHeader>
                  <Clock className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Real-Time Event Discovery</CardTitle>
                  <CardDescription>
                    Find out what's happening right now at venues near you, with up-to-date information.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-[var(--light-gray)] hover:border-[var(--vibrant-teal)] transition-colors text-[var(--charcoal-gray)]">
                <CardHeader>
                  <Filter className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Precise Event Filtering</CardTitle>
                  <CardDescription>
                    Filter by specific event types, from live music genres to themed nights and drink specials.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-[var(--light-gray)] hover:border-[var(--vibrant-teal)] transition-colors text-[var(--charcoal-gray)]">
                <CardHeader>
                  <Compass className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Bar Atmosphere Classification</CardTitle>
                  <CardDescription>
                    Find the perfect vibe with our detailed venue categorization system.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Bar Types Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[var(--dark-sapphire)] text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-[var(--goldenrod)] text-[var(--dark-sapphire)] hover:bg-[var(--goldenrod)]/90">Venue Types</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Find Your Perfect Atmosphere</h2>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We categorize venues to help you find exactly the atmosphere you're looking for.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <Beer className="h-12 w-12 text-[var(--vibrant-teal)] mb-2" />
                <h3 className="text-xl font-bold">Dive Bar</h3>
                <p className="text-gray-300">Casual, unpretentious spots with character</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Cocktail className="h-12 w-12 text-[var(--vibrant-teal)] mb-2" />
                <h3 className="text-xl font-bold">Cocktail Lounge</h3>
                <p className="text-gray-300">Sophisticated venues with craft cocktails</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Wine className="h-12 w-12 text-[var(--vibrant-teal)] mb-2" />
                <h3 className="text-xl font-bold">Wine Bar</h3>
                <p className="text-gray-300">Elegant spaces focused on wine selection</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Music className="h-12 w-12 text-[var(--vibrant-teal)] mb-2" />
                <h3 className="text-xl font-bold">Club</h3>
                <p className="text-gray-300">High-energy venues with dancing and DJs</p>
              </div>
            </div>
          </div>
        </section>

        {/* For Users Section */}
        <section id="for-users" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90">For Users</Badge>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-[var(--charcoal-gray)]">
                    Discover Events That Match Your Vibe
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text text-[var(--charcoal-gray)]">
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
                      <h3 className="font-bold text-[var(--charcoal-gray)]">Event-Centric Search</h3>
                      <p className="text-muted-foreground text-[var(--charcoal-gray)]">
                        Find specific events like live jazz, trivia nights, or happy hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-[var(--vibrant-teal)]/10 p-2">
                      <MapPin className="h-5 w-5 text-[var(--vibrant-teal)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--charcoal-gray)]">Location-Based Discovery</h3>
                      <p className="text-muted-foreground text-[var(--charcoal-gray)]">Find venues and events near you, wherever you are</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-[var(--vibrant-teal)]/10 p-2">
                      <Calendar className="h-5 w-5 text-[var(--vibrant-teal)]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--charcoal-gray)]">Real-Time Updates</h3>
                      <p className="text-muted-foreground text-[var(--charcoal-gray)]">See what's happening tonight or plan for the weekend</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Button className="bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90 text-white">Download App</Button>
                </div>
              </div>
              <div className="mx-auto flex items-center justify-center">
                <Tabs defaultValue="events" className="w-full max-w-[400px]">
                  <TabsList className="grid w-full grid-cols-2 bg-[var(--light-gray)]">
                    <TabsTrigger value="events" className="text-[var(--charcoal-gray)] data-[state=active]:bg-white data-[state=active]:text-[var(--charcoal-gray)]">Events</TabsTrigger>
                    <TabsTrigger value="venues" className="text-[var(--charcoal-gray)] data-[state=active]:bg-white data-[state=active]:text-[var(--charcoal-gray)]">Venues</TabsTrigger>
                  </TabsList>
                  <TabsContent value="events" className="mt-4 space-y-4">
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-[var(--charcoal-gray)]">Live Jazz Night</h4>
                          <p className="text-sm text-muted-foreground text-[var(--charcoal-gray)]">The Blue Note</p>
                        </div>
                        <Badge className="bg-[var(--goldenrod)] text-[var(--dark-sapphire)] hover:bg-[var(--goldenrod)]/90">Tonight</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-[var(--charcoal-gray)]" />
                        <span className="text-[var(--charcoal-gray)]">8:00 PM - 11:00 PM</span>
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
                          <h4 className="font-bold text-[var(--charcoal-gray)]">Trivia Night</h4>
                          <p className="text-sm text-muted-foreground text-[var(--charcoal-gray)]">The Local Tavern</p>
                        </div>
                        <Badge className="bg-[var(--vibrant-teal)] hover:bg-[var(--vibrant-teal)]/90">Tomorrow</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-[var(--charcoal-gray)]" />
                        <span className="text-[var(--charcoal-gray)]">7:00 PM - 9:00 PM</span>
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
                        <h4 className="font-bold text-[var(--charcoal-gray)]">The Speakeasy</h4>
                        <p className="text-sm text-muted-foreground text-[var(--charcoal-gray)]">Cocktail Lounge</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-[var(--charcoal-gray)]" />
                        <span className="text-[var(--charcoal-gray)]">0.5 miles away</span>
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
                        <h4 className="font-bold text-[var(--charcoal-gray)]">Hopworks Brewery</h4>
                        <p className="text-sm text-muted-foreground text-[var(--charcoal-gray)]">Brewery</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-[var(--charcoal-gray)]" />
                        <span className="text-[var(--charcoal-gray)]">1.2 miles away</span>
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

        {/* Event Categories Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-[var(--charcoal-gray)] text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-[var(--goldenrod)] text-[var(--dark-sapphire)] hover:bg-[var(--goldenrod)]/90">Event Categories</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Find Events That Match Your Mood
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive event categories help you discover exactly what you're looking for.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-[var(--dark-sapphire)] border-[var(--vibrant-teal)] text-white">
                <CardHeader>
                  <Music className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Live Music</CardTitle>
                  <CardDescription className="text-gray-300">Jazz, Rock, Folk, and more</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-[var(--dark-sapphire)] border-[var(--vibrant-teal)] text-white">
                <CardHeader>
                  <Mic className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Performance</CardTitle>
                  <CardDescription className="text-gray-300">Karaoke, Comedy, Open Mic</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-[var(--dark-sapphire)] border-[var(--vibrant-teal)] text-white">
                <CardHeader>
                  <Gamepad2 className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Themed Nights</CardTitle>
                  <CardDescription className="text-gray-300">Trivia, Game Nights</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-[var(--dark-sapphire)] border-[var(--vibrant-teal)] text-white">
                <CardHeader>
                  <Music className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Music Events</CardTitle>
                  <CardDescription className="text-gray-300">DJ Performances, Live Bands</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-[var(--dark-sapphire)] border-[var(--vibrant-teal)] text-white">
                <CardHeader>
                  <Beer className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Drink Specials</CardTitle>
                  <CardDescription className="text-gray-300">Happy Hour, Tasting Events</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-[var(--dark-sapphire)] border-[var(--vibrant-teal)] text-white">
                <CardHeader>
                  <Star className="h-10 w-10 text-[var(--vibrant-teal)] mb-2" />
                  <CardTitle>Special Events</CardTitle>
                  <CardDescription className="text-gray-300">Holiday parties, Celebrations</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* For Businesses Section */}
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
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-background py-6">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Beer className="h-6 w-6 text-[var(--vibrant-teal)]" />
                <span className="text-xl font-bold">To The Pub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover your perfect night out with our nightlife discovery platform.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="\the-app" className="text-muted-foreground hover:text-[var(--vibrant-teal)] transition-colors">
                    The App
                  </Link>
                </li>
                <li>
                  <Link href="\the-business" className="text-muted-foreground hover:text-[var(--vibrant-teal)] transition-colors">
                    For Businesses
                  </Link>
                </li>
                <li>
                  <Link href="\about" className="text-muted-foreground hover:text-[var(--vibrant-teal)] transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-[var(--vibrant-teal)] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-[var(--vibrant-teal)] transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-[var(--vibrant-teal)] transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="mailto:info@tothepub.com"
                    className="text-muted-foreground hover:text-[var(--vibrant-teal)] transition-colors"
                  >
                    info@tothepub.com
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-[var(--vibrant-teal)] transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-6">
            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} To The Pub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}