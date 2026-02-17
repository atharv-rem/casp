import type { Metadata } from "next";
import { Rethink_Sans, Cal_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import { Toaster } from "@/components/ui/sonner";

const rethink = Rethink_Sans({
  weight: ["400", "500", "600", "700","800"],
  subsets: ["latin"],
  variable: "--font-rethink",
  display: "swap",
});

const cal = Cal_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Casp",
  description: "Efficiently allocate manpower to get the most out of your workforce.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rethink.variable} ${cal.variable} bg-white`}>
      <body className={rethink.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}

