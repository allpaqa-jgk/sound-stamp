import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "sound-stamp",
  description: "Audio watermark generator/analyzer for streamers"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
