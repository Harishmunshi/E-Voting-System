import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M.E.S. Student Council E-Voting",
  description: "Secure student council e-voting platform for M.E.S. English Medium School.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
