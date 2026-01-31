---
description: Automatically stages all changes, generates a meaningful commit message based on the diff, and commits them.
---

1.  **Stage all changes**
    First, stage all modified, deleted, and untracked files to ensure `git diff` captures everything intended for the commit.

    ```bash
    git add -A
    ```

2.  **Analyze changes**
    Read the staged changes to understand what needs to be summarized.

    ```bash
    git diff --cached
    ```

3.  **Generate Commit Message and Commit**
    Based on the diff output, craft a high-quality commit message.
    
    **Guidelines for the Commit Message:**
    -   **Language**: ALWAYS use English.
    -   **Subject Line**: concise summary (under 50 chars if possible). Use prefixes if applicable (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `style:`).
    -   **Body**: If the changes are complex, provide a bulleted list of details using multiple `-m` flags.
    
    **Example Command:**
    ```bash
    git commit -m "feat: Add intelligent commit workflow" -m "- implemented /commit workflow to auto-generate messages\n- updated documentation"
    ```

    Propose the `git commit` command with your generated message.
