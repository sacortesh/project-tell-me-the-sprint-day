import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tell Me The Sprint Day",
  description: "A minimalistic website that tells you what sprint day it is today",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
