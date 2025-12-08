import type { Metadata } from "next";
import "../globals.css";
import localFont from "next/font/local";

const kal = localFont({
  src: [
    { path: '../fonts/KalamaykaVF.woff2', style: 'normal' },
  ],
  variable: '--font-kal',
});

export const metadata: Metadata = {
  title: "Dashboard"
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className={kal.variable}>{children}</div>;
}

