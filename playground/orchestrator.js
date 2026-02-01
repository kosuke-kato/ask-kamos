const fs = require('fs');
const path = require('path');

// Try to resolve modules from functions/node_modules if local ones aren't found
const FUNCTIONS_NODE_MODULES = path.resolve(__dirname, '../functions/node_modules');
if (fs.existsSync(FUNCTIONS_NODE_MODULES)) {
    module.paths.push(FUNCTIONS_NODE_MODULES);
}

// Check for required modules
try {
    require.resolve('axios');
    require.resolve('@google/genai');
} catch (e) {
    console.error("Error: Required modules (axios, @google/genai) not found.");
    console.error("Please ensure you have installed dependencies in the 'functions' directory:");
    console.error("  cd functions && npm install");
    process.exit(1);
}

// --- Load .env (Simple Parser) ---
// --- Load .env (Simple Parser) ---
const envPaths = [
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../functions/.env')
];

let envLoaded = false;
envPaths.forEach(envPath => {
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        });
        console.error(`[Orchestrator] Loaded environment variables from ${envPath}`);
        envLoaded = true;
    }
});

if (!envLoaded) {
    console.warn("[Orchestrator] Warning: No .env file found in root or functions/ directory.");
}

const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

// --- Configuration ---
const G_API_KEY = process.env.GEMINI_API_KEY;
// Default to Emulator URL. Change to Production URL if needed.
const KAMOS_FUNC_URL = process.env.KAMOS_FUNC_URL || "http://127.0.0.1:5001/ask-kamos/asia-northeast1/askKamos";

if (!G_API_KEY) {
    console.error("Error: GEMINI_API_KEY environment variable is required.");
    console.error("Usage: GEMINI_API_KEY=AIza... node orchestrator.js <your_input>");
    process.exit(1);
}

// User Prompt from Command Line Args
const args = process.argv.slice(2);

// Extract flags and prompt
let matrixSize = 0; // 0 means matrix mode is off unless flag is present
const cleanArgs = [];
for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('-m')) {
        // Check for -m5 or -m=5
        const val = arg.replace(/^-m=?/, '');
        if (val) {
            matrixSize = parseInt(val, 10);
        } else {
            // Check next arg if it's a number
            if (i + 1 < args.length && /^\d+$/.test(args[i + 1])) {
                matrixSize = parseInt(args[i + 1], 10);
                i++; // Skip next arg
            } else {
                matrixSize = 3; // Default to 3 if no number provided
            }
        }
    } else if (arg === '--matrix') {
        matrixSize = 3;
    } else {
        cleanArgs.push(arg);
    }
}

// Cap matrix size
if (matrixSize > 5) matrixSize = 5;
if (matrixSize < 0) matrixSize = 3; // Fallback if parsing failed strangely

const userPrompt = cleanArgs.join(" ");
const isMatrixMode = matrixSize > 0;

if (!userPrompt) {
    console.error("Error: Please provide a prompt.");
    console.error("Usage: node orchestrator.js [-m <number>] \"Some complex question...\"");
    process.exit(1);
}

const genai = new GoogleGenAI(G_API_KEY);

// --- Main Logic ---
async function main() {
    try {
        console.error(`\n[Orchestrator] Input: "${userPrompt}"`);
        console.error(`[Orchestrator] Target Function: ${KAMOS_FUNC_URL}`);

        if (isMatrixMode) {
            console.error(`[Orchestrator] Mode: Matrix (${matrixSize} Tasks x 3 Phases = ${matrixSize * 3} Steps)`);
        }

        // 1. Split into N Tasks
        console.error(`[Orchestrator] Step 1: Splitting prompt into ${matrixSize || 3} tasks...`);
        const tasks = await splitInputIntoTasks(userPrompt, matrixSize || 3);
        console.error("[Orchestrator] Tasks Identified:", JSON.stringify(tasks, null, 2));

        // 2. Run N Parallel Director Loops
        console.error(`[Orchestrator] Step 2: Running ${tasks.length} parallel Ask Kamos sessions...`);
        const sessionPromises = tasks.map((task, idx) => runKamosSession(task, idx + 1));
        const sessions = await Promise.all(sessionPromises);

        // 3. Aggregate Results
        console.error(`[Orchestrator] Step 3: Aggregating ${sessions.length * 3} matrices and synthesizing...`);
        const finalOutput = await synthesizeAll(userPrompt, sessions);

        // 4. Output JSON to Stdout (for piping)
        const outputJson = JSON.stringify(finalOutput, null, 2);
        console.log(outputJson);

        // Save to file
        const outputDir = path.resolve(__dirname, 'outputs');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `analysis_${timestamp}.json`;
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, outputJson);
        console.error(`\n[Orchestrator] Saved output to: ${filePath}`);

        console.error("\n[Orchestrator] Done. JSON output generated.");

    } catch (error) {
        console.error("Fatal Error:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
        process.exit(1);
    }
}

// --- Helpers ---

async function splitInputIntoTasks(originalPrompt, count = 3) {
    const prompt = `
        You are a strategic planning AI.
        Break down the following user input into ${count} distinct, actionable analysis tasks (sub-problems) for 'Kamos' (another AI agent).
        Each task should explore a different aspect of the problem to ensure comprehensive coverage.
        
        User Input: "${originalPrompt}"

        Output ONLY a raw JSON array of ${count} strings. Example: ["Task 1...", ... "Task ${count}..."]
        Do not include markdown formatting or explanations.
    `;

    const result = await genai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    });

    try {
        let text;
        if (result.response && typeof result.response.text === 'function') {
            text = result.response.text();
        } else if (typeof result.text === 'function') {
            text = result.text();
        } else if (result.text) {
            text = result.text;
        } else {
            console.error("Unexpected Gemini response structure:", result);
            throw new Error("Could not extract text from Gemini response");
        }
        // Cleanup potential markdown blocks if Gemini ignores instructions
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const tasks = JSON.parse(text);
        if (!Array.isArray(tasks) || tasks.length !== count) throw new Error("Count mismatch");
        return tasks;
    } catch (e) {
        console.error("JSON Parse Error on Split:", e);
        // Fallback
        return Array.from({ length: count }, (_, i) => `${originalPrompt} (Aspect ${i + 1})`);
    }
}

async function runKamosSession(taskPrompt, sessionId) {
    try {
        console.error(`  [Session ${sessionId}] Starting: "${taskPrompt.substring(0, 30)}..."`);

        // Request Stream
        const response = await axios({
            method: 'post',
            url: KAMOS_FUNC_URL,
            data: {
                prompt: taskPrompt,
                autonomousMode: true,
                useGoogleSearch: true,
                includePastArticles: false
            },
            responseType: 'stream',
            timeout: 120000 // 2 mins max
        });

        const phases = [];
        let summary = "";

        // Parse SSE Stream
        const stream = response.data;

        // Simple buffer handling for chunks
        let buffer = "";

        // Helper to process a line
        const processLine = (line) => {
            if (line.startsWith('data: ')) {
                const jsonStr = line.substring(6).trim();
                if (!jsonStr) return;
                try {
                    const data = JSON.parse(jsonStr);
                    if (data.phaseNum && !data.isFinal) {
                        phases.push({
                            phaseNum: data.phaseNum,
                            prompt: data.directorPrompt,
                            result: data.analysis
                        });
                        console.error(`  [Session ${sessionId}] Phase ${data.phaseNum} complete.`);
                    } else if (data.analysis && data.isFinal) {
                        summary = data.analysis.summary;
                        console.error(`  [Session ${sessionId}] Session finished.`);
                    } else if (data.error) {
                        console.error(`  [Session ${sessionId}] Stream Error:`, data.error);
                    }
                } catch (e) {
                    // Ignore ping/keep-alive or parse errors
                }
            }
        };

        for await (const chunk of stream) {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep last incomplete line

            for (const line of lines) {
                processLine(line);
            }
        }

        // Process remaining buffer
        if (buffer.trim()) processLine(buffer.trim());

        // Validate
        if (phases.length === 0) {
            throw new Error(`Session ${sessionId} produced no phases.`);
        }

        return {
            taskId: sessionId,
            taskPrompt: taskPrompt,
            phases: phases, // Should be 3 phases
            localSummary: summary
        };

    } catch (e) {
        console.error(`  [Session ${sessionId}] Failed: ${e.message}`);
        // Return placeholder structure to allow partial success
        return {
            taskId: sessionId,
            taskPrompt: taskPrompt,
            phases: [],
            error: e.message
        };
    }
}

async function synthesizeAll(masterPrompt, sessions) {
    // Flatten 9 matrices (or fewer if errors)
    let matricesData = "";

    sessions.forEach(sess => {
        matricesData += `\n### Task ${sess.taskId}: ${sess.taskPrompt}\n`;
        if (sess.error) {
            matricesData += `(Error: ${sess.error})\n`;
        } else {
            sess.phases.forEach(p => {
                const reportStr = JSON.stringify(p.result.report || p.result.summary || "No data");
                matricesData += `- Phase ${p.phaseNum} Directive: ${p.prompt}\n  Result: ${reportStr}\n`;
            });
        }
    });

    const synthesisPrompt = `
        You are the 'Grand Orchestrator'.
        You have analyzed a Master Prompt by splitting it into 3 sub-tasks, each running a 3-phase deep analysis chain (total 9 analysis steps).

        Master Prompt: "${masterPrompt}"

        Here is the aggregated data from all 9 analysis matrices (3 sessions x 3 phases):
        ${matricesData}

        Please maximize your intelligence. Synthesize ALL this information into a final, comprehensive "Grand Matrix" or Report.
        
        Structure:
        1. **Executive Summary**: What is the core essence covering all 9 perspectives?
        2. **Multi-Dimensional Analysis**: How do the 3 tasks interact? What are the conflicts or synergies found?
        3. **Strategic Roadmap**: Concrete next steps based on this deep dive.

        Output ONLY JSON in the following format:
        {
            "executive_summary": "...",
            "dimensions": [ ... ],
            "roadmap": [ ... ]
        }
        Do NOT include markdown fencing.
    `;

    const result = await genai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: synthesisPrompt,
        config: { responseMimeType: "application/json" }
    });

    try {
        let text;
        if (result.response && typeof result.response.text === 'function') {
            text = result.response.text();
        } else if (typeof result.text === 'function') {
            text = result.text();
        } else if (result.text) {
            text = result.text;
        } else {
            throw new Error("Could not extract text from Gemini response");
        }
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return {
            masterPrompt: masterPrompt,
            sessions: sessions,
            grandSynthesis: JSON.parse(text)
        };
    } catch (e) {
        return {
            masterPrompt: masterPrompt,
            sessions: sessions,
            grandSynthesisError: e.message,
            rawText: result.response.text()
        };
    }
}

main();
