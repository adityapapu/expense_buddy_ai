import { QuoteIcon } from "./icons"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
}

export default function TestimonialCard({ quote, author, role }: TestimonialCardProps) {
  return (
    <div className="rounded-xl p-6 bg-muted/30 border border-muted hover:shadow-md transition-all duration-300">
      <div className="mb-4 text-primary">
        <QuoteIcon className="h-8 w-8 opacity-50" />
      </div>
      <p className="italic mb-6">{quote}</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
          <span className="font-medium text-sm">{author.charAt(0)}</span>
        </div>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  )
}

