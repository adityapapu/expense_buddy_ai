"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, DollarSign, Home, PieChart, Users } from "lucide-react"
import { ComponentPlaceholderIcon } from "@radix-ui/react-icons"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <DollarSign className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">ExpenseBuddy</span>
      </Link>
      <nav className="flex items-center space-x-4 lg:space-x-6">
        <Button variant="ghost" className={cn("h-9 px-2", pathname === "/dashboard" && "bg-muted font-medium")} asChild>
          <Link href="/dashboard" className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className={cn("h-9 px-2", pathname === "/transactions" && "bg-muted font-medium")}
          asChild
        >
          <Link href="/transactions" className="flex items-center">
            <ComponentPlaceholderIcon className="mr-2 h-4 w-4" />
            <span>Transactions</span>
          </Link>
        </Button>
        <Button variant="ghost" className={cn("h-9 px-2", pathname === "/budgets" && "bg-muted font-medium")} asChild>
          <Link href="/budgets" className="flex items-center">
            <PieChart className="mr-2 h-4 w-4" />
            <span>Budgets</span>
          </Link>
        </Button>
        <Button variant="ghost" className={cn("h-9 px-2", pathname === "/reports" && "bg-muted font-medium")} asChild>
          <Link href="/reports" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </Link>
        </Button>
        <Button variant="ghost" className={cn("h-9 px-2", pathname === "/friends" && "bg-muted font-medium")} asChild>
          <Link href="/friends" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Friends</span>
          </Link>
        </Button>
      </nav>
    </div>
  )
}

