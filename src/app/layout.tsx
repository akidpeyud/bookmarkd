import type { Metadata, Viewport } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { BookmarkdProvider } from "@/lib/store";
import { Navigation } from "@/components/Navigation";
import { LogBookModal } from "@/components/LogBookModal";
import { Toast } from "@/components/Toast";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BOOKMARKD | The Social Reading Platform for Book Lovers",
  description: "Letterboxd for book lovers: track books, write reviews, rate books, build reading lists, and connect with fellow readers.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bookmarkd",
  },
};

export const viewport: Viewport = {
  themeColor: "#6E3511",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lora.variable} ${plusJakarta.variable}`}>
      <body className="bg-[#FAF5ED] text-[#2C221A] min-h-screen flex flex-col md:flex-row antialiased selection:bg-[#FCECD8] selection:text-[#6E3511]">
        <BookmarkdProvider>
          {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
          <Navigation />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 pb-20 md:pb-8 flex flex-col">
            {children}
          </main>

          {/* Global Interactive Modals & Floating Utilities */}
          <LogBookModal />
          <Toast />
          <PwaInstallPrompt />
        </BookmarkdProvider>
      </body>
    </html>
  );
}
