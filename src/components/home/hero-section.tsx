import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRightIcon, GithubIcon } from "lucide-react"

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-3xl"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-10 text-center">
          <Badge className="px-4 py-2 text-sm" variant="outline">
            Open Source & Free
          </Badge>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Take Control of Your Finances
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-xl md:text-2xl">
              Track expenses, manage recurring costs, split bills, and pay effortlessly—all with smart AI assistance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
              <Link href="/dashboard">
                Get Started Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
              <GithubIcon className="mr-2 h-5 w-5" />
              Deploy on Vercel
            </Button>
          </div>

          {/* Dashboard preview - stylized without images */}
          <div className="w-full max-w-4xl mt-12 rounded-xl border bg-card shadow-xl overflow-hidden">
            <div className="p-1 bg-gradient-to-r from-primary/20 to-secondary/20">
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-muted-foreground">expensebuddy.ai/dashboard</div>
              </div>
            </div>
            <div className="p-6 bg-card">
              <div className="flex flex-col space-y-6">
                <div className="flex justify-between items-center">
                  <div className="h-8 w-32 bg-muted rounded-md"></div>
                  <div className="h-8 w-24 bg-primary/20 rounded-md"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-muted/50 rounded-lg p-4">
                    <div className="h-4 w-20 bg-muted mb-2 rounded"></div>
                    <div className="h-6 w-16 bg-primary/20 rounded"></div>
                  </div>
                  <div className="h-24 bg-muted/50 rounded-lg p-4">
                    <div className="h-4 w-20 bg-muted mb-2 rounded"></div>
                    <div className="h-6 w-16 bg-primary/20 rounded"></div>
                  </div>
                  <div className="h-24 bg-muted/50 rounded-lg p-4">
                    <div className="h-4 w-20 bg-muted mb-2 rounded"></div>
                    <div className="h-6 w-16 bg-primary/20 rounded"></div>
                  </div>
                </div>
                <div className="h-64 bg-muted/30 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

