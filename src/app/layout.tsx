import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tell Me The Sprint Day",
  description:
    "A minimalistic website that tells you what sprint day it is today. Quick-glance reference for anyone who works in sprints.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
