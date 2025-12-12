# sound-stamp SOW

This directory contains the Statement of Work (SOW) and related design documents for the **sound-stamp** project.

SOW ファイルは単なる仕様書ではなく、**チェックボックス付きのタスクリスト**としても機能します。  
チェックを付けたタイミングで、かならず Git コミット（できれば小さめの単位）を行う運用を前提とします。  
実装は可能な限り **TDD（テスト駆動開発）** で進め、Red → Green → Refactor のサイクルを基本とします。

- `00_env_setup.md` — 開発環境構築（Docker Compose / Firebase Emulator Suite）
- `01_overview.md` — プロジェクト全体概要・目的
- `02_feature_ab.md` — A/B ウォーターマーク機能の仕様
- `03_feature_c.md` — C（署名付きトークン）ウォーターマーク機能の仕様
- `04_infra.md` — Firebase / インフラ構成
- `05_frontend.md` — フロントエンド技術選定と方針
- `06_backend.md` — バックエンド（Functions / API）方針
- `07_workflow.md` — 開発フロー・フェーズ分割とタスクチェックリスト
