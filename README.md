# Ask Kamos: 思考を醸し、可能性を形にするAIパートナー

<p align="center">
  <img src="https://img.shields.io/badge/Google_Cloud_Hackathon-2026-blue?style=for-the-badge&logo=googlecloud" alt="Hackathon">
  <img src="https://img.shields.io/badge/Gemini_2.0-Agentic_AI-orange?style=for-the-badge&logo=google-gemini" alt="Gemini">
  <img src="https://img.shields.io/badge/Firebase-Serverless-yellow?style=for-the-badge&logo=firebase" alt="Firebase">
</p>

**Ask Kamos** は、Google Gemini 2.0 と自律型エージェント技術を融合させた、次世代の思考パートナーです。単なる回答ツールではなく、あなたのアイデアの「種」を、AIが自律的に問いを立て、深掘りし、構造化することで、新たな発見へと「醸成」します。

---

## ✨ 特徴

### 🌀 思考の醸成（Autonomous Thinking Loop）
一度の入力に対し、AIが3段階の異なるフェーズで思考を深めます。
- **Phase 1: 拡散と発散** - ユーザーの意図を汲み取り、多角的な視点から初期分析を行います。
- **Phase 2: 収束と深掘り** - 前の分析を振り返り、Geminiが「次に深掘りすべき問い」を自律的に立案。課題の本質に迫ります。
- **Phase 3: 結晶化** - 全体の文脈を統合し、具体的な一歩や解決策を提示します。
- **Synthesis: 最終統合** - 全フェーズの対話を通じて得られた「核心」を、優しく、かつ鋭くまとめ上げます。

### 🌿 バイオモルフィック × Material Design 3 Expressive
「醸成」という有機的なプロセスを表現するため、生命の動きを感じさせる **Biomorphic Design** と、Googleの最新デザイン言語 **Material Design 3 Expressive** を融合させました。
- **p5.js Visuals**: 思考の深まりに合わせて変化する流線型（Light Streaks）の背景アニメーション。
- **Glassmorphism**: 深い透明感と磨りガラスのような質感が、集中できる思考空間を演出。
- **M3 Expressive UI**: 柔らかい角丸（Pill Shape）とダイナミックなカラーパレット（Kamos Palette: Deep Violet, Cyan, Amber）。

### 🛠️ 高度なグラウンディング
自律ツール実行エンジン「Kamos Framework」の思想を継承し、最新のGoogle検索結果やプロジェクト固有の知識ベースを活用した、事実に基づく深い分析を提供します。

---

## 🚀 Tech Stack

- **Frontend**: 
  - Vanilla JavaScript
  - Tailwind CSS (Fluid Layouts)
  - p5.js (Generative Background)
  - Marked.js (Premium Typography Support)
- **Backend**: 
  - Firebase Cloud Functions v2 (Node.js 20)
  - Google Gemini 2.0 Flash
  - Firebase Hosting
- **Architecture**: 
  - Event Stream (Server-Sent Events) によるリアルタイムな思考プロセス表示

---

## 🛠 セットアップ & 実行

### 1. 環境構築
```bash
# プロジェクト全体
npm install

# Cloud Functions側
cd functions
npm install
```

### 2. 環境変数の設定
`functions/.env` を作成し、Gemini APIキーを設定してください。
```
GEMINI_API_KEY=your_gemini_api_key_here
KAMOS_API_URL=https://your-kamos-api-endpoint
```

### 3. ローカル開発
```bash
npm run dev
```

### 4. デプロイ
ビルドからデプロイまで一括で実行します。
```bash
npm run deploy
```

---

## 📖 プロジェクト構成
- `/public`: フロントエンド（HTML, CSS, JS, Visuals）
- `/functions`: バックエンド（Firebase Cloud Functions / Gemini Logic）
- `/tools`: 基盤となる分析エンジン（Kamos Framework Core）
- `/.agent`: AIエージェント用のワークフローとスキル定義

---

## 🏆 Hackathon Context
**Google Cloud Japan AI Hackathon Vol.4** 出展作品。
「エージェント」が単なる道具ではなく、人間の思考を増幅させる「パートナー」として進化する未来を具現化しました。
