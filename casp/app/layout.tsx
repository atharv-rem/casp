import type { Metadata } from "next";
import "./globals.css";
import { IBM_Plex_Mono } from "next/font/google";

const ibm = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Employee management OS",
  description: "allocate manpower effciently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ibm.className}>
        {children}
      </body>
    </html>
  );
}
