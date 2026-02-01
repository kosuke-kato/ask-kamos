const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const { GoogleGenAI } = require("@google/genai");
const express = require("express");
const app = express();

// Set global options for Gen 2 functions
setGlobalOptions({
    region: "asia-northeast1",
    timeoutSeconds: 540,
    memory: "1GiB"
});

const KAMOS_API_URL = process.env.KAMOS_API_URL || "https://processmcprequest-x2panoolwa-an.a.run.app";

// Lazily initialize Gemini client
let genaiClient = null;
function getGenAIClient() {
    if (!genaiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not set");
        genaiClient = new GoogleGenAI(apiKey);
    }
    return genaiClient;
}

// Middleware
app.use(cors);
app.use(express.json());

// Main handler - handle both root and /ask (for emulator rewrite issues)
const handleAsk = async (req, res) => {
    const { prompt, useGoogleSearch, includePastArticles, autonomousMode } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    // --- Single Pass Mode ---
    if (!autonomousMode) {
        try {
            const result = await callKamos(prompt, !!useGoogleSearch, !!includePastArticles);
            return res.json({ phases: [{ phaseNum: 1, analysis: result, directorPrompt: prompt }] });
        } catch (error) {
            logger.error("Single Pass Error", error);
            return res.status(500).json({ error: error.message });
        }
    }

    // --- Autonomous Mode (Streaming) ---
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const genai = getGenAIClient();
        let history = "";

        logger.info(`Starting autonomous stream for: ${prompt}`);

        for (let i = 0; i < 3; i++) {
            const phaseNum = i + 1;
            let kamosCommand = "";

            if (phaseNum === 1) {
                // Phase 1: Use raw user prompt directly
                kamosCommand = prompt;
                res.write(`data: ${JSON.stringify({ status: `フェーズ 1: "${kamosCommand}" を分析します`, role: 'system' })}\n\n`);
            } else {
                // Stream status: Gemini Thinking
                res.write(`data: ${JSON.stringify({ status: `思考パートナーのGeminiがこれまでの結果を振り返り、次の視点を探しています...`, role: 'gemini' })}\n\n`);
                const directorPrompt = `
                    あなたは、ユーザーと一緒に考えを深める「フラットな思考パートナー」です。
                    ユーザーが知りたいこと: ${prompt}
                    これまでの分析の流れ: ${history}
                    現在のステップ: ${phaseNum} / 3

                    【あなたの役割】
                    これまでの分析結果を見て、「ここをもっと深掘りすると面白そう」「この視点がまだ足りないかも」というポイントを見つけてください。
                    それを踏まえて、次に Kamos に分析させるための「新しい問い」を一つだけ作ってください。

                    【考えるヒント】
                    フェーズ 2: 表面的な話の裏にある、具体的な課題やモヤモヤする要素への深掘り
                    フェーズ 3: 最終的な「まとめ」に向けて、全体をどう繋げるか、または具体的な一歩の提案

                    出力は必ず日本語で行ってください。
                    堅苦しい表現は避けつつも、Kamos が鋭い分析を返せるような、具体的でワクワクする指令にしてください。
                `;

                const result = await genai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: directorPrompt
                });
                kamosCommand = result.text;
                logger.info(`Phase ${phaseNum} Directive: ${kamosCommand}`);
            }

            // Stream status: Kamos Analyzing
            res.write(`data: ${JSON.stringify({ status: `Kamosが分析を実行中: "${kamosCommand}"`, role: 'kamos' })}\n\n`);

            const result = await callKamos(kamosCommand, !!useGoogleSearch, !!includePastArticles);

            // Build history for Gemini
            history += `\nPhase ${phaseNum} Target: ${kamosCommand}\nResult: ${JSON.stringify(result)}\n`;

            const data = {
                phaseNum,
                directorPrompt: kamosCommand,
                analysis: result,
                isFinal: false
            };

            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }

        // --- Phase 4: Wrap-up (Synthesis) ---
        res.write(`data: ${JSON.stringify({ status: `すべての分析が完了しました。Geminiが全体を統合して最終報告をまとめています...`, role: 'gemini' })}\n\n`);

        const synthesisPrompt = `
            あなたは、ユーザーと一緒に考えを深めてきた「フラットな思考パートナー」です。
            これまでの 3 フェーズ分析の結果をざっと振り返って、全体として何が見えてきたのか、
            ニュートラルな視点で優しくまとめてください。
            
            目的: ${prompt}
            分析の全履歴: ${history}

            【構成案】
            1. 今回の分析のポイント（結局、何が重要だったのか）
            2. 面白かった発見（分析を通じて見えてきた意外な視点など）
            3. 次のステップへのヒント（これからどう進めると楽しそうか）

            出力は必ず日本語で、親しみやすく、かつスッキリとした Markdown 形式で行ってください。
            コンサルタントのような堅苦しい表現は避け、自然な言葉遣いを心がけてください。
        `;

        const wrapupResult = await genai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: synthesisPrompt
        });

        const finalData = {
            phaseNum: 4,
            directorPrompt: "分析のふりかえり (Wrap-up)",
            analysis: {
                summary: wrapupResult.text,
                title: "全体を通して見えたこと"
            },
            isFinal: true
        };

        res.write(`data: ${JSON.stringify(finalData)}\n\n`);
        res.end();
    } catch (error) {
        logger.error("Autonomous Loop Failure", error);
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
};

app.post("/", handleAsk);
app.post("/ask", handleAsk);

exports.askKamos = onRequest(app);

async function callKamos(prompt, useGoogle, includeRAG) {
    const token = process.env.KAMOS_API_TOKEN;
    if (!token) throw new Error("KAMOS_API_TOKEN missing in server environment");

    const payload = {
        data: {
            prompt,
            useGoogleSearch: useGoogle,
            includePastArticles: includeRAG,
            includeSavedAnalyses: includeRAG
        }
    };

    const response = await axios.post(KAMOS_API_URL, payload, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        timeout: 120000
    });

    if (response.data.error) throw new Error(`Kamos API Error: ${response.data.error}`);
    return response.data.result;
}
