// app/layout.tsx
import "./globals.css";

import Header from "@/components/layout/Header";
import FooterNav from "@/components/layout/FooterNav";

export const metadata = {
  title: "AIエンジニア向け技術ニュース",
  description: "最新のAI技術動向を一行要約で素早くチェック",
  icons: {
    icon: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1F2937" />
        {/* iOS向け（任意） */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <Header />
        {/* main にフッター分＋アイコン余白分を確保 */}
        <main className="flex-grow container mx-auto px-3 pt-2 pb-7 pb-footer-safe">
          {children}
        </main>
        <FooterNav />
      </body>
    </html>
  );
}
