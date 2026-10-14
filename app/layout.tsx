import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Idea Kutir — House & Studio",
  description:
    "The spatial house and studio of Ashani. A multidisciplinary design practice moving between UX/UI systems, ethnography, visual storytelling, speculative design, and filmmaking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans transition-colors duration-500">
        {children}
      </body>
    </html>
  );
}
