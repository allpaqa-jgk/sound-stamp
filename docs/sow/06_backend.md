# 06. バックエンド SOW — Cloud Functions / API

## 1. 役割

バックエンドは **主に C ウォーターマーク（トークン）の発行・検証** を担う。

- クライアントに秘密鍵を渡さずに、署名付きトークンを発行する。
- 解析された token128 が sound-stamp 正規発行のものであるかを検証する。
- 必要に応じて Firestore に保存されたメタデータ（uid, 日付など）を返す。

A/B ウォーターマークについてはバックエンド処理は不要。

## 2. 技術選択

- Firebase Cloud Functions (Node.js 20)
- Firestore
- 署名には以下のいずれかを検討：
  - ECDSA (P-256) + token に対する署名を圧縮
  - HMAC ベースの擬似トークン（サービス側のみで検証可能）

初期実装ではシンプルな HMAC ベースのトークン生成から開始し、  
必要に応じて公開鍵暗号ベースに移行する。

## 3. API インターフェース案

### 3.1 `POST /api/token/issue`

- 認証: Firebase Auth（Google ログイン済）必須
- 入力 (JSON):
  - `uid`: クライアント送信不要。Functions 側で `context.auth.uid` を使用。
  - `streamDate`: オプション（日付）
  - `metadata`: `{ appVersion, aHash, bHash }` など

- 出力 (JSON):
  - `token`: 128bit を hex / base64url で表現した文字列
  - `tokenId`: Firestore 上のドキュメントID
  - `createdAt`: timestamp

### 3.2 `POST /api/token/verify`

- 認証: 任意（公開エンドポイントにしても良い）
- 入力:
  - `token`: 解析で得られた token128 表現

- 出力:
  - `valid`: boolean
  - `uid`: ひもづく UID（必要に応じてマスク）
  - `streamDate`
  - `metadata`

## 4. セキュリティ

- HMAC 方式の場合、Secret は Functions 側の環境変数または Google Secret Manager で管理する。
- クライアントには Secret を一切渡さない。
- 認証済みユーザーのみ `issue` API を呼べるようにする。
- `verify` API は公開でも構わないが、Rate Limit を設ける。

## 5. 実装フェーズ

1. Phase A/B 完了後に Functions プロジェクトを追加。
2. `functions/src/index.ts` に API エンドポイントを定義。
3. Firestore スキーマ (`tokens`) を作成。
4. クライアント側からの呼び出しロジック（`fetch`/SDK）を追加。
