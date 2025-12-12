# 05. フロントエンド技術選定 — sound-stamp

## 1. 要求事項

- Web ブラウザ上で完結するノイズ生成 UI
- 画像 A/B のアップロード・パラメータ設定・プレビュー・ダウンロード
- OBS のブラウザソースとして読み込める軽量 UI
- 静的ホスティング（Firebase Hosting）で完結
- 将来的に Firebase Auth / Firestore / Functions と連携可能であること

## 2. 候補比較：Nuxt vs Next

### Nuxt (Vue)

- 長所：
  - Vue に慣れた開発者には書きやすい
  - `nuxt generate` による静的サイト出力が可能

- 短所：
  - TypeScript + 高度な音声処理・WASM 周りの情報量は React/Next に比べるとやや少ない
  - 個人開発で既に Next.js/GCP/Firebase に慣れている場合、学習コストが増える

### Next (React)

- 長所：
  - TypeScript との親和性が高い
  - `output: 'export'` による静的サイト出力が可能
  - WebAudio / FFT / WASM 系のサンプルやライブラリが豊富
  - React エコシステムを活かせる
  - Firebase との連携事例が多い

- 短所：
  - 特になし（本プロジェクトの要件に対して）

## 3. 結論

> **Next.js + TypeScript を採用し、`output: 'export'` で静的サイトとして Firebase Hosting にデプロイする。**

### 理由まとめ

- sound-stamp の A/B 機能は SSR を必要とせず、完全にクライアントで完結できるため、  
  **静的エクスポート + SPA** で問題ない。
- TypeScript + React + WebAudio という組み合わせは知見・サンプルが多く、  
  実装・検証が進めやすい。
- 将来的に C 機能で Functions / Firestore と連携する場合でも、  
  クライアント側は静的出力のままで問題ない。

## 4. プロジェクト構成

```txt
soundstamp/
  apps/
    web/           # Next.js アプリ
  packages/
    core/          # STFT・ウォーターマーク共通ロジック
  functions/       # Firebase Functions (Phase C)
  docs/            # SOW など
```

`apps/web` 配下の構成（例）：

```txt
apps/web/
  src/
    app/           # App Router
      page.tsx
      obs/
        page.tsx   # OBS 向け専用 UI
    components/
    lib/
      firebase.ts  # Firebase クライアント初期化
      audio/       # WebAudio ヘルパー
```

## 5. デザイン・UI ポリシー

- 音声処理が主役のため、UI はシンプルかつ軽量
- Tailwind CSS を利用し、デザインコストを最小化
- OBS 用ページはダークテーマ・シンプル UI（サイズ固定／レスポンシブ優先度低め）
