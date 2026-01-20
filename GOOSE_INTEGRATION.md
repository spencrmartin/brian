# 🧠 Brian + Goose Integration Guide

Your Brian knowledge base is now integrated with Goose! This allows you to seamlessly store, search, and retrieve information from your personal knowledge base while chatting with Goose.

## ✅ Setup Complete

The Brian MCP server has been added to your Goose configuration at:
- **Config**: `~/.config/goose/config.yaml`
- **Extension**: `brian` (enabled)
- **Status**: Ready to use!

## 🚀 Quick Start

Simply restart Goose Desktop and you can start using Brian naturally in your conversations:

### Example Conversations

**Storing Information:**
```
You: Save this link about React Server Components: https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023

Goose: I'll save that to your Brian knowledge base.
[uses create_knowledge_item tool]
Goose: Saved! I've added it with tags: react, server-components, web-dev
```

**Searching Your Knowledge:**
```
You: What do I know about React?

Goose: Let me search your knowledge base...
[uses search_knowledge tool]
Goose: You have 5 items about React:
1. React Server Components (link)
2. React Hooks Best Practices (note)
3. Custom Hook for API calls (code)
...
```

**Finding Related Content:**
```
You: Find items similar to my React hooks note

Goose: [uses find_similar_items tool]
Goose: Here are 4 similar items:
1. useState patterns (similarity: 0.87)
2. useEffect cleanup (similarity: 0.76)
...
```

**Getting Context:**
```
You: Give me context on machine learning

Goose: [uses get_knowledge_context tool]
Goose: Here's what you have on machine learning:
- 3 direct matches
- 2 related items about neural networks
...
```

## 🛠️ Available Tools

Brian provides 7 powerful tools for knowledge management:

### 1. **search_knowledge**
Search across all your knowledge items.

**Parameters:**
- `query` (required): Search terms
- `item_type` (optional): Filter by type (note, link, code, paper)
- `limit` (optional): Max results (default: 10)

**Example:**
```
Search for "python async" in code snippets
```

### 2. **create_knowledge_item**
Add new items to your knowledge base.

**Parameters:**
- `title` (required): Item title
- `content` (required): Main content
- `item_type` (required): note, link, code, or paper
- `tags` (optional): Array of tags
- `url` (optional): URL for links
- `language` (optional): Programming language for code

**Example:**
```
Save this Python async/await pattern as a code snippet with tags: python, async, patterns
```

### 3. **find_similar_items**
Find items similar to a specific item using AI similarity.

**Parameters:**
- `item_id` (required): ID of reference item
- `threshold` (optional): Similarity threshold 0.0-1.0 (default: 0.15)
- `limit` (optional): Max results (default: 5)

**Example:**
```
Find items similar to item #42
```

### 4. **get_item_details**
Get full details of a specific item.

**Parameters:**
- `item_id` (required): Item ID

**Example:**
```
Show me the full details of item #42
```

### 5. **get_knowledge_context**
Get comprehensive context on a topic (combines search + similarity).

**Parameters:**
- `topic` (required): Topic or concept
- `limit` (optional): Max items (default: 5)

**Example:**
```
Get me context on "React hooks"
```

### 6. **update_knowledge_item**
Update existing items.

**Parameters:**
- `item_id` (required): Item to update
- `title` (optional): New title
- `content` (optional): New content
- `tags` (optional): New tags
- `url` (optional): New URL

**Example:**
```
Update item #42 to add tags: advanced, tutorial
```

### 7. **list_all_tags**
Get all unique tags in your knowledge base.

**Example:**
```
What tags do I use in my knowledge base?
```

## 📊 Available Resources

Brian also provides resources that Goose can access:

### brian://stats
Overall statistics about your knowledge base:
- Total items
- Items by type
- Total unique tags
- Favorite count

### brian://graph
Connection graph showing relationships between items:
- All nodes (items)
- Edges (connections)
- Similarity relationships

### brian://recent
Your 10 most recently created items.

## 💡 Usage Tips

### Natural Language
Just talk naturally! Goose understands intent:
```
"Remember this link for later"
"What did I save about TypeScript?"
"Show me my Python code snippets"
"Find notes related to my React article"
```

### Automatic Tagging
When you save items, Goose can suggest relevant tags:
```
You: Save this article about Next.js 14 app router

Goose: I'll save that with suggested tags: nextjs, react, app-router, web-dev
```

### Context-Aware Retrieval
Goose can pull relevant knowledge automatically:
```
You: Help me write a React component

Goose: Let me check what you have on React...
[searches your knowledge base]
Goose: Based on your saved patterns, here's a component following your style...
```

### Batch Operations
```
You: Save these 3 links about Rust:
1. https://...
2. https://...
3. https://...

Goose: [creates 3 knowledge items]
Goose: Saved all 3! Tagged with: rust, programming, systems
```

## 🔧 Technical Details

### Architecture
- **Protocol**: Model Context Protocol (MCP)
- **Transport**: stdio (standard input/output)
- **Database**: SQLite at `~/.brian/brian.db`
- **Python**: Uses your brian venv at `/Users/spencermartin/brian/venv`

### How It Works
1. Goose starts the Brian MCP server as a subprocess
2. Communication happens via JSON-RPC over stdio
3. Brian accesses your SQLite database directly
4. Results are returned to Goose for natural language responses

### Performance
- **Fast**: Direct database access, no HTTP overhead
- **Efficient**: Only loads when Goose needs it
- **Isolated**: Runs in separate process, won't affect Goose

## 🐛 Troubleshooting

### Brian not showing up in Goose

1. **Restart Goose Desktop** - Config changes require restart
2. **Check extension is enabled** - Look in Settings > Extensions
3. **Verify Python path** - Make sure `/Users/spencermartin/brian/venv/bin/python` exists

### Tools not working

1. **Check database exists**: 
   ```bash
   ls -la ~/.brian/brian.db
   ```

2. **Verify database has data**:
   ```bash
   sqlite3 ~/.brian/brian.db "SELECT COUNT(*) FROM knowledge_items;"
   ```

3. **Test MCP server manually**:
   ```bash
   cd /Users/spencermartin/brian
   source venv/bin/activate
   python test_mcp_simple.py
   ```

### Errors in Goose logs

Check Goose logs for Brian-related errors:
- Look for "brian-knowledge" in log output
- Check for Python import errors
- Verify PYTHONPATH is set correctly

### Database locked

If you get "database is locked" errors:
- Make sure Brian web app is NOT running
- Only one process can write to SQLite at a time
- Close any other connections to the database

## 📚 Advanced Usage

### Custom Workflows

**Research Assistant:**
```
You: I'm researching GraphQL. Find everything I have on it and summarize the key points.

Goose: [searches + gets context]
Goose: You have 7 items on GraphQL. Key themes:
1. Schema design (3 items)
2. Performance optimization (2 items)
3. Client-side caching (2 items)

Would you like me to elaborate on any of these?
```

**Code Reference:**
```
You: Show me my Python async patterns and create a new example combining them

Goose: [searches code snippets]
Goose: Here are your 4 async patterns. I'll combine them into a new example...
[creates code]
Goose: Should I save this new pattern to your knowledge base?
```

**Link Curation:**
```
You: Find all my React links from the last month and organize them by topic

Goose: [searches + analyzes]
Goose: Found 12 React links:
- Hooks & State (5)
- Server Components (4)
- Performance (3)

I can create a summary note if you'd like?
```

### Integration with Other Extensions

Brian works great with other Goose extensions:

**With Web Search:**
```
You: Search for React 19 features and save the best articles

Goose: [uses web search + brian]
Goose: Found 5 great articles. Saved them all with tags: react, react19, features
```

**With Code Search:**
```
You: Find React patterns in my codebase and save them as snippets

Goose: [uses code search + brian]
Goose: Found 8 patterns. Saved as code snippets with your project context.
```

## 🎯 Best Practices

### Tagging Strategy
- Use consistent tag names (lowercase, hyphenated)
- Create tag hierarchies: `react`, `react-hooks`, `react-server-components`
- Tag broadly for discoverability

### Content Organization
- **Links**: Always include URL, add summary in content
- **Notes**: Use markdown for formatting
- **Code**: Always specify language, add context in content
- **Papers**: Include authors, year, key findings

### Regular Maintenance
```
You: Show me my knowledge base stats

Goose: [uses brian://stats resource]
Goose: You have 234 items:
- 120 links
- 67 notes
- 35 code snippets
- 12 papers
```

## 🚀 Next Steps

1. **Start using it!** - Just chat naturally with Goose
2. **Import existing knowledge** - Use Brian's web interface to bulk import
3. **Develop workflows** - Create patterns that work for you
4. **Explore connections** - Use similarity search to discover relationships

## 📖 Additional Resources

- **Brian README**: `/Users/spencermartin/brian/README.md`
- **MCP Server Details**: `/Users/spencermartin/brian/brian_mcp/README.md`
- **Goose Config**: `~/.config/goose/config.yaml`
- **Database**: `~/.brian/brian.db`

## 🎉 You're All Set!

Your personal knowledge base is now seamlessly integrated with Goose. Start saving links, notes, and code snippets naturally in your conversations!

---

**Questions or issues?** Check the troubleshooting section or review the MCP server logs.
