import { PieChartIcon, QrCodeIcon, RefreshCwIcon, SparklesIcon, UsersIcon, WalletIcon } from "lucide-react"
import FeatureCard from "./feature-card"

export default function FeaturesSection() {
  return (
    <section className="w-full py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="h-1 w-12 bg-primary mb-4"></div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Powerful Features</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Everything you need to manage your finances in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<WalletIcon className="h-10 w-10" />}
            title="Expense Tracking"
            description="Quickly add and manage daily spending with an intuitive UI. See exactly where your money is going."
            gradient="from-blue-500/20 to-cyan-500/20"
          />
          <FeatureCard
            icon={<RefreshCwIcon className="h-10 w-10" />}
            title="Recurring Expenses"
            description="Easily track recurring expenses like EMIs, subscription fees, and other regular costs."
            gradient="from-purple-500/20 to-pink-500/20"
          />
          <FeatureCard
            icon={<PieChartIcon className="h-10 w-10" />}
            title="Budget Allocation"
            description="Set monthly budgets and allocate amounts to different categories. Adjust on the fly."
            gradient="from-amber-500/20 to-orange-500/20"
          />
          <FeatureCard
            icon={<UsersIcon className="h-10 w-10" />}
            title="Bill Splitting"
            description="Split bills with friends instantly—no more manual calculations or confusion."
            gradient="from-green-500/20 to-emerald-500/20"
          />
          <FeatureCard
            icon={<QrCodeIcon className="h-10 w-10" />}
            title="QR Code Payments"
            description="Scan QR codes and pay via any UPI app directly from the interface."
            gradient="from-red-500/20 to-rose-500/20"
          />
          <FeatureCard
            icon={<SparklesIcon className="h-10 w-10" />}
            title="AI Integration"
            description="Use natural language queries to add expenses or get spending insights."
            gradient="from-indigo-500/20 to-violet-500/20"
          />
        </div>
      </div>
    </section>
  )
}

