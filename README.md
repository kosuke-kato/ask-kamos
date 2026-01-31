# Ask Kamos: Your Recursive Thinking Partner

## 概要
**Ask Kamos** は、Google Gemini 2.0 と Agentic AI 技術を駆使して、あなたの思考の壁打ち相手となる自律型Webエージェントです。
単なるチャットボットではなく、「Director Mode」により自ら問いを立て、深掘りし、あなたのアイデアを構造化して返します。

## Hackathon Entry
**Google Cloud Japan AI Hackathon Vol.4** 応募作品

### テーマ
進化するAIと共に君だけの「エージェント」を創り出そう

### 特徴
- **Recursive Thinking**: 1つの問いに対して、AIが自律的に視点を変えながら複数回思考を巡らせる「再帰的思考プロセス」。
- **Grounding**: ローカルの知識ベースやGoogle検索を統合し、事実に基づいた対話を実現。
- **Agentic Integration**: バックエンドは自律的にツールを選択・実行するエージェント構造（Kamos Frameworkの思想を継承）。

## Tech Stack
- **Frontend**: Vanilla JS, Tailwind CSS, p5.js (Visual Effects)
- **Backend**: Firebase Cloud Functions (Gen 2), Google Gemini 2.0 Flash/Pro
- **Hosting**: Firebase Hosting

## Setup
```bash
npm install
firebase emulators:start
```
