# 🧠 Brian + Goose Quick Reference

## 🎯 Common Commands

### Save Content
```
"Save this link: [URL]"
"Remember this note about [topic]"
"Store this code snippet"
"Add this to my knowledge base with tags: [tags]"
```

### Search & Retrieve
```
"What do I know about [topic]?"
"Search my knowledge base for [query]"
"Show me my [type] about [topic]"
"Find my notes on [subject]"
```

### Find Related
```
"Find items similar to [item]"
"What's related to my [topic] note?"
"Show connections to [item]"
```

### Get Context
```
"Give me context on [topic]"
"What have I saved about [subject]?"
"Summarize my knowledge on [area]"
```

### Manage Items
```
"Update item #[id] with [changes]"
"Add tags [tags] to item #[id]"
"Show me item #[id]"
"What tags do I use?"
```

### Browse & Explore
```
"Show my recent items"
"What are my knowledge base stats?"
"Show me the connection graph"
"List all my tags"
```

## 📦 Item Types

| Type | Use For | Example |
|------|---------|---------|
| **link** | Web articles, resources | Blog posts, documentation |
| **note** | Personal thoughts, summaries | Meeting notes, ideas |
| **code** | Code snippets, examples | Functions, patterns |
| **paper** | Research papers, articles | Academic papers, whitepapers |

## 🏷️ Tagging Tips

- **Be consistent**: Use lowercase, hyphenated tags
- **Be specific**: `react-hooks` not just `react`
- **Be hierarchical**: `python`, `python-async`, `python-async-patterns`
- **Be descriptive**: `tutorial`, `reference`, `best-practices`

## 🔧 7 Available Tools

1. **search_knowledge** - Full-text search
2. **create_knowledge_item** - Add new items
3. **find_similar_items** - AI-powered similarity
4. **get_item_details** - Full item info
5. **get_knowledge_context** - Comprehensive context
6. **update_knowledge_item** - Modify items
7. **list_all_tags** - All unique tags

## 📊 3 Resources

1. **brian://stats** - Knowledge base statistics
2. **brian://graph** - Connection graph
3. **brian://recent** - Recent items

## 💡 Pro Tips

### Batch Operations
```
"Save these 3 links about [topic]: [URLs]"
```

### Auto-tagging
```
"Save this and suggest tags"
```

### Context-aware
```
"Help me with [task]" 
→ Goose automatically searches your knowledge base
```

### Combine with Search
```
"Search the web for [topic] and save the best results"
```

## 🚨 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Brian not showing | Restart Goose Desktop |
| Tools not working | Check `~/.brian/brian.db` exists |
| Database locked | Close Brian web app |
| Import errors | Test: `cd ~/brian && source venv/bin/activate && python test_mcp_simple.py` |

## 📍 Important Paths

- **Config**: `~/.config/goose/config.yaml`
- **Database**: `~/.brian/brian.db`
- **Project**: `/Users/spencermartin/brian`
- **Venv**: `/Users/spencermartin/brian/venv`

## 🎬 Example Workflows

### Research Session
```
1. "Search web for [topic]"
2. "Save the best 3 articles"
3. "Give me context on [topic]"
4. "Create a summary note"
```

### Code Reference
```
1. "Show me my [language] snippets"
2. "Find similar patterns"
3. "Create a new example combining them"
4. "Save the new pattern"
```

### Link Curation
```
1. "Show my recent links"
2. "Find links about [topic]"
3. "Organize by tags"
4. "Create a summary"
```

## 🔗 Full Documentation

See `GOOSE_INTEGRATION.md` for complete guide with examples and advanced usage.

---

**Quick Start**: Just restart Goose and start chatting naturally! 🚀
