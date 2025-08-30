import type { Metadata } from "next"
import { ReportsPageContent } from "./reports-page-content"

export const metadata: Metadata = {
  title: "Financial Reports | ExpenseBuddy",
  description: "View detailed reports and analytics of your financial activities",
}

export default function ReportsPage() {
  return <ReportsPageContent />
}

