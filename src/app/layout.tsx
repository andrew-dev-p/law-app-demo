import type { Metadata } from "next";
import { Geist_Mono, Mulish } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/app/header";
import { SetupAccountGate } from "@/components/app/setup-account-gate";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  display: "swap",
  weight: ["300","400","500","600","700"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PI Client Portal",
  description: "Personal Injury client portal demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mulish.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground font-sans`}>
        <ClerkProvider>
          <AppHeader />
          <SetupAccountGate />
          <main className="min-h-[calc(100vh-57px)]">{children}</main>
          <Toaster position="top-right" richColors closeButton />
        </ClerkProvider>
      </body>
    </html>
  );
}
