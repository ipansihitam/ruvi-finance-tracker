import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/ruvi/providers";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ruvi - Rupiah Visual",
  description: "Aplikasi personal finance tracker dengan fitur AI-powered insights. Kelola keuangan, budget, hutang, dan investasi dengan mudah.",
  keywords: ["finance", "personal finance", "budget", "money manager", "rupiah", "indonesia"],
  authors: [{ name: "Ruvi Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Ruvi - Rupiah Visual",
    description: "Personal Finance Tracker dengan AI Insights",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${jakartaSans.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
