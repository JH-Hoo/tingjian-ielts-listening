import type { Metadata } from "next";
import { Noto_Sans_SC, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_SC({ variable: "--font-sans", subsets: ["latin"] });
const serif = Playfair_Display({ variable: "--font-serif", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "听见 · IELTS Listening Practice",
  description: "完整四部分雅思听力机考练习与即时判分。",
  openGraph: {
    title: "听见 · IELTS Listening Practice",
    description: "完整 Part 1–4，40 题连续听力练习与即时判分。",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "听见 IELTS Listening Practice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "听见 · IELTS Listening Practice",
    description: "完整 Part 1–4，40 题连续听力练习与即时判分。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
