This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## News Feeds Configuration

- Environment variables in `.env.local` control data sources.
- `USE_MOCK`: `true` to use local mock JSON, `false` for live RSS.
- `EXTRA_RSS_FEEDS`: Comma or newline separated RSS URLs merged with Google News search results.

Example:

```
EXTRA_RSS_FEEDS=https://qiita.com/tags/ai/feed,\
https://qiita.com/tags/llm/feed,\
https://qiita.com/tags/github-copilot/feed,\
https://b.hatena.ne.jp/hotentry/it.rss,\
https://openai.com/blog/rss.xml,\
https://ai.googleblog.com/feeds/posts/default,\
https://blogs.nvidia.com/feed/
```

Notes:
- Some feeds may not support keyword search; the app applies a client-side filter against title/snippet.
- You can tune queries via the UI (strict match, sort order) or add `-site:example.com` in the search box to exclude domains.
