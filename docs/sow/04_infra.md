# 04. インフラ SOW — Firebase 構成

## 1. 全体方針

- インフラは **Firebase を中心** に構成する。
- ホスティングは **Firebase Hosting の静的ホスティング**。
- A/B 機能は **完全にフロントエンドのみで完結** させる。
- C 機能追加時にのみ **Firestore / Cloud Functions** を利用する。

## 2. Firebase プロジェクト

- Project ID: `sound-stamp`
- 利用サービス：
  - Firebase Hosting
  - Firestore
  - Firebase Authentication
  - Cloud Functions (Node 20)

## 3. Hosting

- デプロイ対象: Next.js 静的出力 (`apps/web/out`)
- URL 例:
  - `https://sound-stamp.web.app/`
- SPA として動作させるため、`firebase.json` で SPA 設定を有効化。

```jsonc
{
  "hosting": {
    "public": "apps/web/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

（必要に応じて調整）

## 4. Firestore

### 4.1 導入タイミング

- Phase A/B：不要（ Auth も optional ）  
- Phase C：トークン管理のために導入

### 4.2 コレクション設計（最小）

- `users/{uid}`
  - `createdAt`
  - `displayName` など（任意）

- `tokens/{tokenId}`
  - `uid`
  - `createdAt`
  - `streamDate`
  - `metadata`（アプリバージョンなど）

## 5. Firebase Authentication

### 5.1 ログイン方式

- 初期実装では **Google ログインのみ** をサポートする。

理由：

- 配信者は Google アカウントを持っているケースが圧倒的に多い。
- パスワード管理・リセット等のフローを省略できる。
- Auth 実装がシンプルになり、Firestore とも連携しやすい。

メール/パスワード認証は、明確なユーザー要望が出てから検討する。

## 6. Cloud Functions

### 6.1 導入タイミング

- Phase C 以降に導入。
- A/B のみの運用期間は Functions 不要。

### 6.2 役割

- `issueToken`：署名付き token128 を発行し、Firestore に保存する。
- `verifyToken`：解析で得られた token128 を検証し、紐付く情報を返す。

これにより、クライアント側に秘密鍵を渡すことなく、  
ユーザーは自分の音源が正当なものかをサーバ経由で検証できる。

## 7. CI/CD

### 7.1 デプロイフロー

1. `pnpm build:web`
2. `pnpm export:web`
3. `firebase deploy --only hosting`

将来的に GitHub Actions で以下を自動化：

- `push` / `main` ブランチへの merge 時に自動デプロイ
- Functions を含む構成に拡張した場合は `--only hosting,functions` を使い分ける。

## 8. コスト・スケーリング

- Firebase Hosting / Functions / Firestore は、  
  初期段階（小規模ユーザー）では無料枠〜低料金枠に収まる見込み。
- App Hosting や重い SSR は採用せず、静的サイト + Functions でコストを最小化する。
