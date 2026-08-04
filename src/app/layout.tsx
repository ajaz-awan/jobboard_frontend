// src/app/layout.tsx
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}