---
description: Deploy Cloud Functions in batches to avoid Quota Exceeded errors
---

# Deploy Functions in Batches

This workflow runs a script that splits the Cloud Functions deployment into smaller batches (default 15 functions per batch).
This prevents the "Write requests per minute per region" quota error from Google Cloud Run/Cloud Functions API when deploying many functions at once.

1. Run the batched deployment script
// turbo
python3 tools/deploy_functions_batched.py
