---
name: google_knowledge
description: Access the local knowledge base of Google's latest releases, blog updates, and technical news.
---

# Google Knowledge Skill

This skill allows you to access locally cached updates from Google's official blogs and release notes.

## Support Data Sources
- **The Keyword**: Official Google updates (AI, Products, Company).
- **Google Cloud Release Notes**: GCP technical updates.
- **Android Developers Blog**: Android development news.

## Tool Usage
The data is stored in a SQLite database: `.agent/knowledge/knowledge.db`.

1. **Check for Updates**:
   Before answering questions about "latest Google features" or "new APIs", checking this database is recommended.

2. **Query the Knowledge Base**:
   Use `sqlite3` via `run_command` or dedicated Python scripts to query.
   ```bash
   # Search for "Gemini" related articles using Full Text Search (FTS)
   sqlite3 .agent/knowledge/knowledge.db "SELECT title, summary FROM articles_fts WHERE articles_fts MATCH 'Gemini' ORDER BY rank LIMIT 5;"
   
   # Get latest 5 articles
   sqlite3 .agent/knowledge/knowledge.db "SELECT title, published FROM articles ORDER BY timestamp DESC LIMIT 5;"
   ```

3. **Update Data**:
   If the user asks to "refresh" info, run the update workflow:
   ```bash
   /update_knowledge
   # OR directly:
   python3 tools/fetch_google_updates.py
   ```

## Integration with Kamos
You can use this data to ground Kamos analyses.
1. Query the DB for relevant articles based on the user's topic.
2. Pass the retrieved content as context to `ask_kamos.py`.
