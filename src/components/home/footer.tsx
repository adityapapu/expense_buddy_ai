import Link from "next/link"
import { DollarSignIcon, GithubIcon } from "lucide-react"
import { TwitterIcon, LinkedinIcon } from "./icons"

export default function Footer() {
  return (
    <footer className="w-full py-8 md:py-12 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSignIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Expanse Buddy AI</span>
          </div>
          <p className="text-muted-foreground max-w-md">
            Your intelligent partner in tracking expenses and managing finances.
          </p>

          <div className="flex space-x-5 md:space-x-6 mt-4">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors p-1">
              <GithubIcon className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors p-1">
              <TwitterIcon className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors p-1">
              <LinkedinIcon className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>

          <div className="pt-6 md:pt-8 border-t w-full max-w-md">
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Expanse Buddy AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

