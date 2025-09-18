import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const geistSans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lottery Spin",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} antialiased text-gray-800 bg-[radial-gradient(1000px_500px_at_50%_-150px,rgba(168,85,247,0.18),transparent),radial-gradient(800px_400px_at_80%_-50px,rgba(14,165,233,0.16),transparent),radial-gradient(900px_500px_at_20%_20%,rgba(244,114,182,0.14),transparent)] bg-[#f8fafc] min-h-dvh`}
      >
        {children}
      </body>
    </html>
  );
}
