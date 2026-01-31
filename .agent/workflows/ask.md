---
description: Ask Kamos for analysis or brainstorming via the Ask Kamos Skill. Usage: /ask <your prompt>
---


1. **Analyze Input**: Check if the user's prompt (metadata `${1}`) contains the `-x` flag (e.g., `-x 3`).

   - **If `@google` is detected**:
     1. Search local Google knowledge DB for relevant keywords in the prompt.
     2. Extract top search results.
     3. Prepare context string: "Based on the following Google updates: [Search Results...]"
     4. Remove `@google` from the prompt and append the context.
     5. Run: `python3 tools/ask_kamos.py -g "<Modified Prompt>"`
   - **If `-x` is detected**: Follow the instructions in `.agent/skills/kamos_director/SKILL.md` to manually iterate using `tools/ask_kamos.py`.
   - **Else (Normal Mode)**: Run the standard Ask Kamos script.
     ```bash
     python3 tools/ask_kamos.py -g "${1}"
     ```

3. **Fetch Result**:
   - **CRITICAL**: After the script finishes, you MUST run `view_file` on `.agent/temp/kamos_latest.json` to get the full, untruncated analysis data.
   - Even in Auto mode, the *last* result is stored there, which represents the final conclusion.

4. **Report**: Summarize the final output for the user based on the JSON content.
