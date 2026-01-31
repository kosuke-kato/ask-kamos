---
description: Update project documentation to reflect the current codebase state using the update_docs skill.
---

1.  **Load the Skill**
    Read the instructions in `.agent/skills/update_docs/SKILL.md`.

    ```bash
    cat .agent/skills/update_docs/SKILL.md
    ```

2.  **Execute Documentation Update**
    Follow the "Usage" steps defined in the `update_docs` skill strictly.
    - Analyze the current file structure and git history.
    - Review `docs/` contents.
    - Identify discrepancies.
    - Updates `ARCHITECTURE.md`, `FEATURES.md`, `API_REFERENCE.md` and others as needed.
    
    *Self-Correction during execution*: If you find that the changes are too massive, prioritize the most critical updates (e.g., deleted features or major new integrations like BigQuery).

3.  **Sync to Google Drive**
    Upload the updated documentation to Google Drive so that Gemini Gems are also up-to-date.

    ```bash
    python3 tools/sync_docs_to_drive.py
    ```
