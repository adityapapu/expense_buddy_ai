import type { Metadata } from "next"
import { AnalyticsPageContent } from "./analytics-page-content"

export const metadata: Metadata = {
  title: "Financial Analytics | ExpenseBuddy",
  description: "View detailed analytics and insights of your financial activities",
}

export default function AnalyticsPage() {
  return <AnalyticsPageContent />
}

