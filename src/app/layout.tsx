import type { Metadata } from "next";
import { AuthProvider } from "@/context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Share-Note",
  description: "For when you have a note that's too good to not share.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
