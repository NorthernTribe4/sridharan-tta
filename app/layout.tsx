import type { Metadata } from "next"
import { Manrope, Inter } from "next/font/google"
import { Toaster } from "sonner"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { WebsiteFeedbackWidget } from "@/components/site/website-feedback-widget"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    template: "%s | Sridharan Table Tennis Academy",
    default: "Sridharan Table Tennis Academy — Chennai",
  },
  description:
    "World-class table tennis training for players of all ages in Chennai, Tamil Nadu. Structured coaching, tournament pathways, and a passionate community.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Sridharan Table Tennis Academy",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en-IN"
      className={`${manrope.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WebsiteFeedbackWidget />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
