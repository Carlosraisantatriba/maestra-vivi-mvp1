import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Complemento + Tutor IA",
  description: "MVP1 3ro Argentina"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
