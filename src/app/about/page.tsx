import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function About() {
    return (
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="inline-flex bg-[#00B8D4] hover:bg-[#00B8D4]/90">About Us</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-[var(--charcoal-gray)]">Our Mission</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-[var(--charcoal-gray)]">
                  To The Pub is dedicated to connecting people with the perfect nightlife experiences and helping venues
                  reach their ideal customers.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-6 py-12 text-center">
              <p className="text-muted-foreground text-[var(--charcoal-gray)]">
                We believe that finding the right place to spend your evening shouldn't be a challenge. Our platform is
                built to help you discover venues and events that match exactly what you're looking for, whether it's a
                quiet wine bar with live jazz or a high-energy club with the best DJs.
              </p>
              <p className="text-muted-foreground text-[var(--charcoal-gray)]">
                For businesses, we provide a platform to showcase what makes your venue special and connect you with
                customers who are actively seeking the experiences you offer.
              </p>
              <div className="pt-6">
                <Button className="bg-[#00B8D4] hover:bg-[#00B8D4]/90 text-white">Download App</Button>
              </div>
            </div>
          </div>
        </section>
    )
}