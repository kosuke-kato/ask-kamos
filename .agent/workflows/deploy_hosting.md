---
description: Deploy Firebase Hosting files only
---

# Deploy Hosting

This workflow deploys only the static hosting files (public directory) to Firebase Hosting.
It does NOT deploy Cloud Functions. Use this when you have only made changes to frontend code (HTML, CSS, JS).

1. Run the hosting deployment command
// turbo
npx firebase deploy --only hosting
