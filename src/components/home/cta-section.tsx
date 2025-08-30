import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRightIcon } from "lucide-react"

export default function CTASection() {
  return (
    <section className="w-full py-20 bg-gradient-to-br from-primary/20 to-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Take Control of Your Finances?</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of users who are already managing their expenses smarter with Expanse Buddy AI.
          </p>
          <Button size="lg" className="h-12 px-8 text-lg" asChild>
            <Link href="/dashboard">
              Get Started for Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

