// components/layout/FooterNav.tsx
"use client";
import Link from "next/link";
import {
  HiHome,
  HiStar,
  HiSearch,
  HiCog,
  HiInformationCircle,
} from "react-icons/hi";

export default function FooterNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 12px)",
        height: `calc(3rem + env(safe-area-inset-bottom, 12px))`,
      }}
    >
      {[
        { href: "/", icon: HiHome, label: "ホーム" },
        { href: "/favorites", icon: HiStar, label: "お気に入り" },
        { href: "/search", icon: HiSearch, label: "検索" },
        { href: "/settings", icon: HiCog, label: "設定" },
        { href: "/about", icon: HiInformationCircle, label: "アバウト" },
      ].map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          className="flex-1 flex items-center justify-center"
        >
          <Icon size={28} />
        </Link>
      ))}
    </nav>
  );
}
