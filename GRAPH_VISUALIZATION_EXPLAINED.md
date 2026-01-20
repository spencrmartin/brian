# Graph Visualization - How It Works 🕸️

## Issue: New Google Docs Not Showing in Graph

You saved a Google Doc but it's not appearing in the graph visualization with connections to other documents.

## How the Graph Works

### 1. **Two Types of Connections**

The Brian knowledge graph supports two types of connections:

#### A. **Manual Connections** (stored in database)
- Created explicitly via the UI or API
- Stored in the `connections` table
- Permanent until deleted
- Example: You manually link two related papers

#### B. **Similarity Connections** (computed on-demand)
- Calculated using TF-IDF + cosine similarity
- **NOT stored in database** - computed fresh each time
- Fetched from `/api/v1/similarity/connections` endpoint
- Parameters:
  - `threshold`: Minimum similarity score (default: 0.15)
  - `max_per_item`: Max connections per item (default: 5)

### 2. **The Graph Visualization Component**

Location: `frontend/src/components/SimilarityGraph.jsx`

**What it does:**
1. Fetches all items from the knowledge base
2. Calls `/api/v1/similarity/connections?threshold=0.15&max_per_item=5`
3. Computes TF-IDF vectors for all items
4. Calculates cosine similarity between all pairs
5. Returns connections above the threshold
6. Renders the force-directed graph using D3.js

## Why Your Google Doc Might Not Show Connections

### Possible Reasons:

1. **✅ The document WAS saved correctly**
   - You can see it in search results
   - It has full content (not just a URL)
   - It's saved as type 'paper' or 'note'

2. **❌ Similarity threshold is too high**
   - Default threshold: 0.15 (15% similarity)
   - Your new doc might have < 15% similarity to existing docs
   - Solution: Lower the threshold

3. **❌ Graph hasn't refreshed yet**
   - The web app might be showing cached data
   - Solution: Refresh the page or click the Graph tab again

4. **❌ Content is too short or too unique**
   - Very short documents may not have enough terms for similarity
   - Highly unique content may not match existing items
   - Solution: This is expected behavior

5. **❌ No other similar documents exist**
   - If this is your first document on a topic, it won't have connections
   - Solution: Add more related documents

## How to Debug

### Step 1: Verify the Document Was Saved Correctly

**Via Goose:**
```
"Search Brian for [document title]"
```

**Expected:** Should return the document with full content

### Step 2: Check Similarity Scores

**Via Goose:**
```
"Find similar items to [document ID]"
```

**Or manually test the API:**
```bash
# Get the document ID first
curl http://localhost:8080/api/v1/search?q=your+document+title

# Then find similar items (replace ITEM_ID)
curl "http://localhost:8080/api/v1/similarity/related/ITEM_ID?threshold=0.1&top_k=10"
```

This will show you:
- What items are similar
- Their similarity scores
- Whether any are above the threshold

### Step 3: Lower the Threshold

The graph component is hardcoded to use `threshold=0.15`. To see more connections:

**Option A: Modify the frontend (temporary test)**
```javascript
// In frontend/src/components/SimilarityGraph.jsx, line ~20
const response = await fetch('http://localhost:8080/api/v1/similarity/connections?threshold=0.10&max_per_item=10')
```

**Option B: Use the API directly**
```bash
# Try with lower threshold
curl "http://localhost:8080/api/v1/similarity/connections?threshold=0.05&max_per_item=10"
```

### Step 4: Check What's in the Graph

**Via browser console (F12):**
```javascript
// See what connections were found
fetch('http://localhost:8080/api/v1/similarity/connections?threshold=0.15&max_per_item=5')
  .then(r => r.json())
  .then(data => {
    console.log(`Found ${data.length} connections`);
    console.log(data);
  });
```

## Expected Behavior

### For a Well-Connected Document:
- **Similarity > 0.3**: Strong connection (thick line in graph)
- **Similarity 0.15-0.3**: Moderate connection (medium line)
- **Similarity < 0.15**: Weak connection (not shown by default)

### For a New Document:
- If it shares keywords/topics with existing docs → Shows connections
- If it's on a new topic → No connections (this is normal!)
- If it's very short → May not have enough terms for similarity

## Solutions

### If No Connections Are Showing:

1. **Refresh the web app** - The graph might be cached
2. **Lower the threshold** - Try 0.10 or 0.05 to see more connections
3. **Add more content** - Ensure the document has substantial text
4. **Add related documents** - One document alone won't have connections
5. **Check the document type** - Should be 'paper' or 'note', not 'link'

### If You Want Manual Connections:

You can create explicit connections via the API:

```bash
curl -X POST http://localhost:8080/api/v1/connections \
  -H "Content-Type: application/json" \
  -d '{
    "source_item_id": "doc1-id",
    "target_item_id": "doc2-id",
    "connection_type": "related",
    "strength": 1.0
  }'
```

These will show up in the graph alongside similarity connections.

## Testing Your Specific Case

Let me help you debug! Please provide:

1. **The document ID** - Get it from the save response or search results
2. **The document title** - So I can search for it
3. **Expected related documents** - What should it connect to?

Then I can:
- Check if it was saved correctly
- Calculate similarity scores
- Determine why connections aren't showing
- Suggest the right threshold

## Quick Fix: Refresh the Graph

**Try this first:**
1. Open the Brian web app: http://localhost:8080
2. Click on the "Graph" tab
3. Press **Ctrl+Shift+R** (hard refresh) or **Cmd+Shift+R** on Mac
4. Wait for the graph to recompute

The similarity service computes connections fresh each time, so a refresh should show your new document if it has sufficient similarity to existing items.

---

**Status:** Debugging in progress  
**Next:** Test with specific document to determine exact issue
