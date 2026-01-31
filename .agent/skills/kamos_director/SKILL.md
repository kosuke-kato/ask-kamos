---
name: kamos_director
description: Recursively analyzes a topic using Kamos (ask_kamos.py), with the AI Agent acting as the 'Director' to refine prompts and deepen analysis iteratively.
---

# Kamos Director Skill

As the **Director**, your goal is to lead an in-depth analysis session by iteratively commanding the Kamos script (`tools/ask_kamos.py`). You don't just run the command once; you evaluate the output and decide what to ask next.

## Role & Responsibility

-   **You are the Director**: You determine the direction of the analysis.
-   **Kamos is the Analyst**: The script `tools/ask_kamos.py` is your tool to get information.

## Workflow Instructions

When the user asks for a deep analysis or uses the `/ask -x` pattern:

1.  **Parse Request**: Identify the **Topic** and the desired number of **Iterations** (default to 1 if unspecified).

2.  **Execute & Refine Loop**:
    Perform the analysis cycles. You can combine updating the previous step's note and starting the next step in a single command.

    -   **Iteration 1**:
        -   Run: `python3 tools/ask_kamos.py "Topic"`
    
    -   **Subsequent Iterations (2 to N)**:
        -   Based on the previous output, formulate your **Next Prompt** and **Director's Comment**.
        -   Run: `python3 tools/ask_kamos.py --update-note "COMMENT_ON_PREVIOUS" --next-prompt "CURRENT_PROMPT" "CURRENT_PROMPT"`
        -   *Note*: Providing the prompt twice (once for metadata and once as the actual prompt) ensures both the viewer and the analyst are synced.

    -   **After the Last Iteration**:
        -   Finalize the session by recording your critique of the final results.
        -   Run: `python3 tools/ask_kamos.py --update-note "FINAL_COMMENT" --next-prompt "Analysis Complete"`

3.  **Final Synthesis**:
    -   After all iterations are complete, present a **Final Executive Summary** to the user.
    -   Highlight the progression and key insights.

## Core Optimization

-   **Merge Steps**: `ask_kamos.py` is designed to handle both `--update-note` and a new analysis prompt in one execution. Always use this "one-shot" approach to save time and provide a smoother experience.
-   **History Preservation**: The script automatically preserves `directorHistory` across analysis runs.

## Example Scenario

**User**: "/ask -x 3 Future of Web Frameworks"

1.  **Cycle 1**:
    -   Run: `python3 tools/ask_kamos.py "Future of Web Frameworks"`
    -   Result: Discusses React, Vue, Svelte generally. Mentions "Server Components" as a rising trend.
2.  **Cycle 2** (Director's Decision):
    -   *Insight*: "Server Components seem to be the biggest shift. Let's dig there."
    -   Run: `python3 tools/ask_kamos.py "Deep dive into Server Components architecture and its impact on developer experience"`
    -   Result: Detailed breakdown of RSC in Next.js. Mentions "Complexity" as a downside.
3.  **Cycle 3** (Director's Decision):
    -   *Insight*: "Complexity is a problem. How do we solve it? Maybe Kamos has ideas on abstraction layers."
    -   Run: `python3 tools/ask_kamos.py "Solutions for reducing complexity in Server Component based architectures"`
    -   Result: Discusses new frameworks or patterns emerging to handle this.

**Final Output**: "Over 3 cycles, we moved from a general overview of web frameworks to a specific analysis of Server Components and solutions for their inherent complexity..."
