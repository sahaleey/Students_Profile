import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nahj-studentsprofile.vercel.app"),

  title: {
    template: "%s | Nahjurrashad Students Portal",
    default: "Nahjurrashad Students Portal",
  },
  description:
    "A comprehensive platform for students to manage their profiles, view programs, and access resources.",
  keywords: [
    "Nahjurrashad",
    "Campus Portal",
    "Student Management",
    "nric",
    "student profiles",
    "nahjurrashad chamakkala",
    "portal",
    "nahjurrashad students portal",
    "nahj",
    "nahjurrashad students profile",
  ],
  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" }, // Perfect size for iOS Home Screen
    ],
  },

  openGraph: {
    title: "Nahjurrashad Students Portal",
    description:
      "Manage student profiles, view programs, and access campus resources efficiently.",
    url: "https://nahj-studentsprofile.vercel.app",
    siteName: "Nahjurrashad Portal",
    images: [
      {
        url: "/campus-bg.jpg",
        width: 1200,
        height: 630,
        alt: "Nahjurrashad Campus Portal Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Toaster position="top-right" />

        {children}
      </body>
    </html>
  );
}
