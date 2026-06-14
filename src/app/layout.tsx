import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "קטלוג כיסאות | יבואן ישיר",
  description: "קטלוג כיסאות משרדיים ומנהלים במחירי יבואן ישיר",
  openGraph: {
    title: "קטלוג כיסאות | יבואן ישיר",
    description: "כיסאות משרדיים ומנהלים איכותיים במחירי יבואן ישיר",
    type: "website",
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
