// app/not-found.tsx
"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-6">お探しのページは見つかりませんでした。</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}
