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
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t p-2 flex justify-around">
      <Link href="/" aria-label="ホーム">
        <HiHome size={24} />
      </Link>
      <Link href="/favorites" aria-label="お気に入り">
        <HiStar size={24} />
      </Link>
      <Link href="/search" aria-label="検索">
        <HiSearch size={24} />
      </Link>
      <Link href="/settings" aria-label="設定">
        <HiCog size={24} />
      </Link>
      <Link href="/about" aria-label="アバウト">
        <HiInformationCircle size={24} />
      </Link>
    </nav>
  );
}
