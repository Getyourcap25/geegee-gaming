import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeeGee Gaming × Incluzio",
  description: "Aanvraagbeheer voor gaming-activiteiten in Delfshaven",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
