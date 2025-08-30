import type React from "react"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

export default function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div
      className={`rounded-xl p-6 bg-gradient-to-br ${gradient} border border-muted hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
    >
      <div className="rounded-full w-16 h-16 flex items-center justify-center bg-background mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

