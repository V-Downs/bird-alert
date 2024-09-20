import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bird Alert - By Iowa Bird Rehabilitation",
  description: "​Wild birds play a critical role in our ecosystem, and with the population of birds in decline, now is the time to make changes. At IBR, we not only want to support our community in providing a place to take injured and orphaned wild birds, but also provide education, outreach, and be a beacon for wildlife conservation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
