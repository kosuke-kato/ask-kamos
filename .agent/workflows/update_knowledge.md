---
description: Updates local knowledge bases by fetching latest data from external sources (e.g., Google Release Notes).
---

This workflow runs various scripts to fetch and update local knowledge files used for grounding.

1. Fetch Google Release Notes and Blog Updates
// turbo
```bash
python3 tools/fetch_google_updates.py
```

2. (Optional) Check for other knowledge scripts
   - If other scripts are added in `tools/` with a similar purpose (e.g., `fetch_*.py`), they should be added here.
