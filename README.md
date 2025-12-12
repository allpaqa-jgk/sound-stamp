# sound-stamp

sound-stamp は、ライブ配信者向けの **音声ウォーターマーク生成・解析ツール** です。  
OBS のブラウザソースで動作し、配信音声へ安全なノイズ署名（A/B/C タイプ）を埋め込み、  
後から解析することで **盗用防止・証拠提示** を可能にします。

## 機能概要

### A: Amplitude Mark（振幅ベースの可視ロゴ）

画像の明度を周波数軸にマッピングし、スペクトログラム上で**視覚的に確認できるノイズパターン**を生成します。

### B: Phase Mark（位相ベースの不可視ロゴ）

位相を制御してスペクトログラム上に直接は見えないロゴを埋め込み、  
ノイズ除去や EQ に強いセカンダリのウォーターマークとして機能します。

### C: Cryptographic Token Mark（128bit 署名トークン）

Firestore + Cloud Functions を用いて発行される **token128** をノイズに埋め込み、  
後からトークンを解析することで  
「この音源は **誰が・いつ** 生成したか」を照合できる仕組みです。

## リポジトリ構成

```
sound-stamp/
  apps/
    web/             # Next.js (静的エクスポート) – UI / OBS 用画面
  packages/
    core/            # DSP / STFT / watermark ロジック
  functions/        # Firebase Cloud Functions (C トークン発行・検証)
  docs/
    sow/            # Statement of Work (SOW)
```

## 開発環境

- Node.js LTS
- pnpm
- Docker Compose
- Firebase Emulator Suite
  - Auth / Firestore / Functions / Hosting（任意）
- CI/CD: GitHub Actions（`push`/`main` でビルド・エクスポート・`firebase deploy --only hosting` を自動化予定）

詳細は **docs/sow/00_env_setup.md** を参照してください。

## SOW（仕様書 / タスクリスト）

SOW は **タスクチェックリストとして使用**します。  
チェックを入れる際には、必ず **対応する Git コミットを同時に行う** 運用です。

一覧は **docs/sow/README.md** を参照してください。  
特に **docs/sow/07_workflow.md** は各フェーズのタスクがチェックボックスとして整理されています。

## 開発プロセス（TDD）

本プロジェクトは **TDD（テスト駆動開発）** を基本とします。

- Red: 失敗するテストを書く
- Green: 最小限の実装でテストを通す
- Refactor: 実装の整理・改善

コア DSP ロジック（STFT / IFFT / A/B/C）や Functions の実装も、  
可能な限りテストを先に書いて進めます。

## ライセンス / 公開方針

現時点では内部利用を想定していますが、  
将来的に OSS として公開する可能性があります。

## 貢献方法

- SOW に沿って作業する
- 必要なら docs/sow を更新する
- Pull Request には関連タスクやテストを含める

## 連絡先

問い合わせや提案があれば、メンテナまで。
