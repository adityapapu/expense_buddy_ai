import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster"

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Providers } from "./providers";
import NavbarComponent from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Track, Split, and Save Smarter",
  description:
    "Simplify your finances with AI-powered expense tracking and bill splitting. Get smart insights, categorize spending automatically, and share costs fairly. Take control of your money and save more, effortlessly.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark`}>
      <body>
        <Providers>
          <NavbarComponent />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
