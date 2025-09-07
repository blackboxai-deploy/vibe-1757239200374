import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Photo Background Remover",
  description: "AI-powered photo background removal tool. Upload your image and get a professional background-free version instantly.",
  keywords: ["background removal", "photo editing", "AI", "image processing"],
  authors: [{ name: "Photo Background Remover" }],
  openGraph: {
    title: "Photo Background Remover",
    description: "AI-powered photo background removal tool",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {children}
        </div>
      </body>
    </html>
  );
}