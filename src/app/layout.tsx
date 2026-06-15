import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AutoVision — The Future of Performance",
  description: "Engineered for those who demand excellence. Experience the pinnacle of automotive design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      {/* suppressHydrationWarning prevents browser extensions (wallets, password managers)
          that inject attributes onto <body> from triggering context-destroying remounts */}
      <body className="bg-[#080808] text-white overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
