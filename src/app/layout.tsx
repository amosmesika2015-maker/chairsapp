import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "קטלוג כיסאות - רהיטי עוצמה",
  description: "כיסאות ארגונומיים ומנהלים ברמה גבוהה. מחירי יבואן ישיר לדילרים, עסקים ומוסדות.",
  openGraph: {
    title: "קטלוג כיסאות - רהיטי עוצמה",
    description: "כיסאות ארגונומיים ומנהלים ברמה גבוהה. מחירי יבואן ישיר לדילרים, עסקים ומוסדות.",
    type: "website",
    images: [{ url: "/logo.png", width: 400, height: 400 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${rubik.variable} font-sans antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
