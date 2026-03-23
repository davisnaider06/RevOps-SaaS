import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; 
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RevOps SaaS",
  description: "Sistema operacional de receita",
  manifest: "/manifest.json", 
  icons: {
    apple: "/icon-192.png", // Ícone para iPhone
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a", 
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Impede zoom (sensação de app nativo)
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}