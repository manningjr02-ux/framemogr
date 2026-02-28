import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: {
    default: "FrameMog — Who Controls The Frame?",
    template: "%s | FrameMog",
  },
  description: "See who's farming the most frame points in any group photo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
