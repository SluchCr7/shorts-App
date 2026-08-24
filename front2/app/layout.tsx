import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "../src/redux/provider";
import Navbar from "../src/components/layout/Navbar";
import Sidebar from "../src/components/layout/Sidebar";
import UploadModal from "../src/components/upload/UploadModal";
import CommentsDrawer from "../src/components/comments/CommentsDrawer";
import AuthPromptModal from "../src/components/auth/AuthPromptModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeShorts - Trending Short Videos & Reels Platform",
  description: "Watch, upload and discover high-speed short videos, viral trends, music, and creators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
        <ReduxProvider>
          <Navbar />
          <div className="flex flex-1 w-full">
            <Sidebar />
            <main className="flex-1 w-full min-w-0">{children}</main>
          </div>
          <UploadModal />
          <CommentsDrawer />
          <AuthPromptModal />
        </ReduxProvider>
      </body>
    </html>
  );
}
