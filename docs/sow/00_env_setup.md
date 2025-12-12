# 00. 開発環境構築 — sound-stamp

## 1. 方針概要

sound-stamp の開発環境は、**Docker Compose + Firebase Emulator Suite** を前提とする。

- すべての開発作業はコンテナ内（Node/Next.js）で行う。
- Firebase Authentication / Firestore / Functions は **エミュレータに接続** して動作確認する。
- 本番 Firebase プロジェクト（`sound-stamp`）への接続は、明示的な設定を行った場合のみ。

## 2. コンテナ構成（イメージ）

Docker Compose で、少なくとも以下のサービスを用意する。

- `web`  
  - Next.js 開発サーバ（`apps/web`）  
  - node:20 + pnpm  
  - Firebase SDK からは「エミュレータ」に接続する設定

- `firebase-emulator`  
  - firebase-tools をインストールした Node イメージ  
  - `firebase emulators:start` を実行  
  - Auth / Firestore / Functions / Hosting エミュレータを起動（少なくとも Auth / Firestore / Functions）

- （将来）`functions`  
  - Cloud Functions のローカル開発用コンテナ（必要なら分離）

すべて同一 Docker ネットワーク上に配置し、  
`firebase-emulator:PORT` というホスト名で他コンテナから参照できるようにする。

## 3. 代表的な docker-compose.yml 例（イメージ）

※実際のポート番号・パスは実装時に調整する。

```yaml
version: "3.9"
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    working_dir: /usr/src/app
    volumes:
      - ./:/usr/src/app
    command: ["pnpm", "dev:web"]
    ports:
      - "3000:3000"
    environment:
      # Firebase Emulator 接続設定
      FIREBASE_AUTH_EMULATOR_HOST: "firebase-emulator:9099"
      FIRESTORE_EMULATOR_HOST: "firebase-emulator:8080"
      FUNCTIONS_EMULATOR_ORIGIN: "http://firebase-emulator:5001"
    depends_on:
      - firebase-emulator

  firebase-emulator:
    image: node:20
    working_dir: /usr/src/app
    volumes:
      - ./:/usr/src/app
    command: ["firebase", "emulators:start", "--only", "auth,firestore,functions"]
    ports:
      - "4000:4000" # Emulator UI
      - "8080:8080" # Firestore
      - "9099:9099" # Auth
      - "5001:5001" # Functions (example)
```

## 4. Firebase Emulator Suite で利用するサービス

当面、以下のエミュレータを使用する。

- **Authentication Emulator**
  - Google ログインをテストするときに利用。
  - 開発時は、エミュレータ上のユーザーで検証する。

- **Firestore Emulator**
  - `tokens` や `users` コレクションの動作確認用。
  - スキーマやセキュリティルールのテストもここで行う。

- **Functions Emulator**
  - `issueToken` / `verifyToken` など C 用 API のローカル開発。
  - エミュレータ上の Firestore / Auth と連携させる。

必要に応じて以下も検討可能：

- **Hosting Emulator**
  - `firebase emulators:start` 時に静的ファイルを配信し、  
    Hosting 本番と同じ URL パスで挙動を確認できる。

現時点では、Next.js 開発サーバ (`web` コンテナ) での確認が中心となるため、  
Hosting Emulator は必須ではないが、将来的に統合テスト用として導入してもよい。

## 5. クライアント側からのエミュレータ接続

Next.js 側では、`NODE_ENV` や環境変数に応じて「エミュレータ or 本番」の切り替えを行う。

### 5.1 Firebase 初期化例（クライアント）

```ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: "sound-stamp.firebaseapp.com",
  projectId: "sound-stamp",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
  connectAuthEmulator(auth, "http://firebase-emulator:9099");
  connectFirestoreEmulator(db, "firebase-emulator", 8080);
}
```

※ 実際には Docker ネットワークのホスト名・ポートに合わせて調整する。

## 6. 他に使えそうな Firebase 機能について

現状の sound-stamp の要件に対して、利用が現実的なものは以下。

### 6.1 すぐに候補になるもの

- **Cloud Storage for Firebase**
  - 解析用に音声ファイルをアップロードさせる機能を後で追加する場合に有用。
  - 例：ユーザーが「盗用疑惑のクリップ」をアップロード → Functions 側で解析 → レポート生成。

- **Firebase Hosting Emulator**
  - Next.js 静的出力を Firebase Hosting で配信する最終形に近い状態でローカル確認したい場合。
  - 本番導入前の一括テストに役立つ。

### 6.2 あれば便利だが「後で良い」もの

- **Firebase Analytics**
  - どのページ・機能がどれくらい使われているかのトラッキング。
  - 有料課金や MAU を意識する段階で検討。

- **Remote Config**
  - 実験的なパラメータ（例：A/B のデフォルト強度）をリモートで切り替えたい場合。
  - 規模が大きくなってからで十分。

- **Crashlytics / Performance**
  - 主にモバイルアプリ向けなので、Web版では優先度低。

当面は：

- Hosting
- Auth
- Firestore
- Functions
- Emulator Suite（上記の 3〜4 サービス）

に集中し、  
必要に応じて Cloud Storage / Analytics / Remote Config を足す方針が現実的である。

## 7. 今後の ToDo（環境構築まわり）

- [ ] `docker-compose.yml` の実ファイルを作成し、`web` / `firebase-emulator` を起動可能にする。
- [ ] `Dockerfile.web` を作成し、Node 20 + pnpm + Next.js 環境を整備する。
- [ ] `.env` / `.env.local` のテンプレートを作成し、エミュレータ用フラグ (`NEXT_PUBLIC_USE_FIREBASE_EMULATOR`) を定義する。
- [ ] Firebase Emulator Suite の UI (`localhost:4000`) から Auth / Firestore / Functions が動作していることを確認する。
