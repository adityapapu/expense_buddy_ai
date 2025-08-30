import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon, DollarSignIcon } from "lucide-react"

export default function WhySection() {
  return (
    <section className="w-full py-20 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[30%] -right-[5%] w-[30%] h-[40%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-[10%] -left-[5%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="space-y-6">
              <div className="h-1 w-12 bg-primary"></div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Born from Frustration, Built for Everyone
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="text-lg">
                  Every month, I struggled to understand where my money was going. I needed a tool that wasn't just a
                  generic expense tracker but one that could handle recurring costs like EMIs and subscriptions.
                </p>
                <p className="text-lg">
                  Expanse Buddy AI was born from that frustration—to create an open-source, visually appealing, and
                  user-friendly solution that integrates smart AI features and simplifies every aspect of financial
                  management.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Try It Now
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
          </div>

          {/* Stylized visualization instead of image */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl opacity-70"></div>
              <div className="absolute inset-4 rounded-full border-8 border-primary/20 flex items-center justify-center">
                <div className="absolute w-3/4 h-3/4 rounded-full border-8 border-dashed border-secondary/20 animate-[spin_30s_linear_infinite]"></div>
                <div className="w-1/2 h-1/2 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center">
                  <DollarSignIcon className="h-12 w-12 text-background" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

