# OUTPUT QUEST

Zenn記事執筆をゲーム化したRPG風学習支援Webアプリ。記事投稿でレベルアップし、称号・アイテム・仲間を獲得。
スコープ外: モバイルアプリ、Zenn以外のプラットフォーム連携、課金機能

## Stack

Next.js 16 (App Router) / React 19 / TypeScript (strict) / Tailwind + CSS Modules / shadcn/ui / Motion / Clerk / Supabase + Prisma / Vercel AI SDK + Gemini

## Structure

```
src/app/          -- App Router、ページ、API Routes
src/components/   -- 共有UI (auth/, common/, elements/, layout/, providers/, ui/)
src/features/     -- 機能モジュール（domain別 components/hooks/types/utils）
src/lib/          -- ライブラリ/ユーティリティ
src/contexts/     -- React Context (AudioContext, HeroContext)
src/config/       -- 環境設定
.docs/            -- 詳細ドキュメント
```

## Rules

- pnpmのみ（理由: npm/yarnとのlockfile競合防止）
- 破壊的変更は確認必須（理由: 影響範囲が広い）
- 技術スタックのバージョン変更禁止（理由: 承認フロー必要）
- RSCデフォルト。`'use client'`は必要時のみ（理由: パフォーマンス + バンドルサイズ）
- 既存コードのパターンに従う
- 雑な対応禁止 -- 一時ファイル放置、gitignoreで隠す等（理由: 根本解決優先）

## Commands

dev:   `pnpm dev`
build: `pnpm build`
lint:  `pnpm lint:fix`
test:  `pnpm test` (watch) / `pnpm test:run` (CI)
db:    `pnpm prisma generate` / `pnpm prisma studio`

## Git

- コミット前に `git status` 実行（セッション開始時の状態は古い可能性あり）
- 形式: `<type>(<scope>): <subject>`
- type: feat / fix / refactor / docs / chore / style

## Docs

- `.docs/index.md` -- ドキュメント入口
- `.claude/rules/` -- パス固有ルール（styling, security, pitfalls）
