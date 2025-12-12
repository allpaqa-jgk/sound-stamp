# Repository Guidelines

## プロジェクト構成

- ルート: `README.md` と `docs/sow/`（SOW/チェックリスト）。スコープ変更時は `docs/sow` を更新。
- 想定レイアウト: `apps/web`（Next.js/OBS 用 UI）, `packages/core`（DSP/ウォーターマーク）, `functions`（Firebase Functions）, `docs/`（将来のドキュメント）。
- TypeScript/ESLint/tsconfig/pnpm workspace などの共有設定はリポジトリ直下にまとめる。

## 開発・ビルド・実行

- `pnpm install` — 依存関係をインストール（Node.js LTS 推奨）。
- `pnpm dev:web` — `apps/web` の開発サーバ。ローカルでは Firebase Emulator を向く。
- `pnpm build:web` → `pnpm export:web` — 本番用ビルドと静的出力（Hosting 用）。
- `firebase emulators:start --only auth,firestore,functions` — ローカルバックエンド起動。`NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` を併用。
- 可能なら Docker Compose 経由で実行し、ポートは `docs/sow/00_env_setup.md` と揃える。

## コーディングスタイル

- TypeScript/ESM 前提。厳格な型チェックを維持。
- インデント 2 スペース、複数行リテラルは末尾カンマ、文字列は基本シングルクォート。
- コンポーネントは PascalCase、hooks/util は camelCase、定数は SCREAMING_SNAKE_CASE。
- DSP ユーティリティは副作用なし・決定的に保ち、テストを実装近くに配置（`__tests__` / `.test.ts`）。
- eslint/prettier をコミット前に実行。

## テスト指針

- `docs/sow/07_workflow.md` に従い TDD（Red → Green → Refactor）を基本とする。
- `packages/core` は STFT/IFFT・A/B 埋め込み/解析のユニットテストを優先。Functions 実装後はトークン発行/検証の結合テストも追加。
- Firebase 関連はエミュレータを使用し、本番プロジェクトには接続しない。
- テスト名は振る舞いを明示（例: `should_restore_logo_from_average_spectrogram`）。

## コミット / PR 方針

- コミットメッセージは命令形・現在形で SOW フェーズ/タスクを併記（例: `feat: add STFT core API (Phase1)`）。
- SOW のチェックを入れるときは必ず対応コードとテストを同一コミットに含める。
- PR には概要・関連タスク・テスト結果（`pnpm test` や UI のスクリーンショット）・エミュレータ利用有無を記載。
- PR は小さく分割し、仕様変更時は `docs/sow/` の更新もセットで行う。

## セキュリティ / 設定

- Firebase 設定は環境変数で管理（`NEXT_PUBLIC_FIREBASE_API_KEY` など）。秘密情報・サービスアカウントをコミットしない。
- ローカルは基本エミュレータをデフォルトとし、本番接続は明示的に opt-in。
- Functions 追加時は入力検証を行い、機微情報をログに残さない。
