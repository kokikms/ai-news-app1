// components/layout/Header.tsx
"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center">
        <Link href="/" className="text-xl font-bold">
          AIニュース
        </Link>
      </div>
    </header>
  );
}
