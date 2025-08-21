// app/layout.tsx
export const metadata = {
  title: "AI News App",
  description: "最新のAI技術動向を一行要約で素早くチェック",
};
import "./globals.css";

import Header from "@/components/layout/Header";
import FooterNav from "@/components/layout/FooterNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main className="container mx-auto px-4 py-6">{children}</main>
        <FooterNav />
      </body>
    </html>
  );
}
