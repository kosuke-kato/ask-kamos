# Experimental Orchestrator CLI

This folder contains experimental CLI tools for Ask Kamos.

## orchestrator.js

This script implements the "9-Matrix Orchestrator" pattern:
1. Breaks down a user prompt into 3 distinct tasks.
2. Runs 3 parallel "Ask Kamos" autonomous sessions (using the existing Cloud Function).
3. Each session runs 3 phases (Total 9 phases).
4. Aggregates all results into a final "Grand Synthesis".

### Usage

**Pre-requisites:**
- You must have dependencies installed in the `functions` directory (`cd functions && npm install`).
- You need a valid `GEMINI_API_KEY`.
- You need the Cloud Functions running (Emulator) OR access to the deployed URL.

**Run Command:**

```bash
# From project root
export GEMINI_API_KEY="AIza..."
node public/playground/orchestrator.js "日本の教育課題について、制度・現場・未来の3つの視点から分析して"
```

**Configuration:**
- Default target URL: `http://127.0.0.1:5001/ask-kamos/asia-northeast1/askKamos` (Emulator)
- To target production, set `KAMOS_FUNC_URL`:
  ```bash
  export KAMOS_FUNC_URL="https://asia-northeast1-ask-kamos.cloudfunctions.net/askKamos"
  ```
