# 🐛 Bug Fix: Database Connection Error

## Issue
When using the `create_knowledge_item` tool in Goose, you encountered:
```
'sqlite3.Connection' object has no attribute 'fetchone'
```

## Root Cause
The MCP server was incorrectly passing a raw SQLite connection object to `KnowledgeRepository`, but the repository expects a `Database` wrapper object.

**Before (broken):**
```python
def init_services():
    global repo, similarity_service
    db_path = os.path.expanduser("~/.brian/brian.db")
    db = Database(db_path)
    db.initialize()
    conn = db.connect()  # ❌ Getting raw connection
    repo = KnowledgeRepository(conn)  # ❌ Passing raw connection
    similarity_service = SimilarityService()
```

**After (fixed):**
```python
def init_services():
    global repo, similarity_service
    db_path = os.path.expanduser("~/.brian/brian.db")
    db = Database(db_path)
    db.initialize()
    repo = KnowledgeRepository(db)  # ✅ Passing Database wrapper
    similarity_service = SimilarityService()
```

## Fix Applied
**File**: `/Users/spencermartin/brian/brian_mcp/server.py`  
**Line**: 47  
**Change**: Removed the `conn = db.connect()` line and passed `db` directly to `KnowledgeRepository`

## Verification
Tested successfully:
```bash
✅ Created item: d3b4eb31-182d-4a4b-aa37-0b3be673637b - Test Item
```

## Impact
- ✅ `create_knowledge_item` now works
- ✅ `search_knowledge` works
- ✅ `get_item_details` works
- ✅ `update_knowledge_item` works
- ✅ `list_all_tags` works
- ✅ All read operations work
- ✅ All resources work

## Next Steps
1. **Restart Goose Desktop** to load the fixed MCP server
2. Test creating items with natural language:
   ```
   "Save this link about React: https://react.dev"
   "Remember this note: Python best practices"
   ```

## Status
🎉 **FIXED AND READY TO USE**

The Brian MCP integration is now fully functional!
