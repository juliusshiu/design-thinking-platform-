import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const requestHost = requestHeaders.get("host") ?? "";
  const localOrigin = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestHost) ? `http://${requestHost}` : null;
  const origin = localOrigin ?? "https://four-d-design-studio.juliusshiu.chatgpt.site";
  const image = `${origin}/og-canvas.png`;
  const title = "4D Design Studio — Canvas-first design thinking";
  const description = "Move from discovery to prototype on one shared canvas, with nested topic boards and stage-specific preset critique.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "4D Design Studio — From discovery to prototype on one shared canvas." }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
