import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  buttonText: string
  buttonLink: string
  gradient: string
}

export default function ActionCard({ icon, title, description, buttonText, buttonLink, gradient }: ActionCardProps) {
  return (
    <div className={`rounded-xl p-8 bg-gradient-to-br ${gradient} border border-muted flex flex-col h-full`}>
      <div className="rounded-full w-16 h-16 flex items-center justify-center bg-background mb-6">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
      <Button className="w-full" asChild>
        <Link href={buttonLink}>{buttonText}</Link>
      </Button>
    </div>
  )
}

