import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoSound — AI Car Diagnostics",
  description: "تشخيص أعطال السيارة بالذكاء الاصطناعي من خلال تحليل الأصوات",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
