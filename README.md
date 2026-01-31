# Ask Kamos

Ask Kamos は、Google Gemini との対話を通じて、入力された問いを多角的に深掘りする思考パートナーです。

## 概要
ユーザーの入力を受けて、AIが自律的に3段階の深掘り指示（Directive）を生成し、それぞれのフェーズで分析を重ねます。最終的に、これまでのすべてのプロセスを統合したまとめ（Synthesis）を提供します。

## 機能
- **3-Phase Analysis**: 初期分析、深掘り、そして統合。
- **Gemini 2.0 Integration**: 最新の Gemini 2.0 Flash による高速な思考プロセスの生成。
- **Streaming UI**: 分析の進捗をリアルタイムに確認できるストリーミングインターフェース。

## セットアップ

### インストール
```bash
npm install
cd functions && npm install
```

### 実行
```bash
# ローカル開発（エミュレータ）
npm run dev

# デプロイ
npm run deploy
```

## Hackathon Context
Google Cloud Japan AI Hackathon Vol.4 応募作品。
---
Built with Firebase & Gemini API.
