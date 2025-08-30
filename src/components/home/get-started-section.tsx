import { ArrowRightIcon, GithubIcon } from "lucide-react"
import ActionCard from "./action-card"
import { BookIcon } from "./icons"

export default function GetStartedSection() {
  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="h-1 w-12 bg-primary mb-4"></div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Get Started Today</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl">
            Join thousands of users who are already taking control of their finances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionCard
            icon={<ArrowRightIcon className="h-8 w-8" />}
            title="Try it Free"
            description="Use our cloud-hosted service or deploy your own version with a single click."
            buttonText="Get Started"
            buttonLink="/dashboard"
            gradient="from-blue-500/10 to-cyan-500/10"
          />
          <ActionCard
            icon={<GithubIcon className="h-8 w-8" />}
            title="Join the Community"
            description="Contribute to our open-source project and help shape the future of expense tracking."
            buttonText="GitHub Repository"
            buttonLink="#"
            gradient="from-purple-500/10 to-pink-500/10"
          />
          <ActionCard
            icon={<BookIcon className="h-8 w-8" />}
            title="Learn More"
            description="Explore our documentation to see how AI and advanced features can transform your financial management."
            buttonText="View Documentation"
            buttonLink="#"
            gradient="from-amber-500/10 to-orange-500/10"
          />
        </div>
      </div>
    </section>
  )
}

