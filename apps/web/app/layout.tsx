import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/provider";



export const metadata: Metadata = {
  title: "Exness",
  description: "Trading platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={``}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
