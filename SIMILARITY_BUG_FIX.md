# Similarity Calculation Bug Fix ✅

## Issue
The "Codename Goose 1.2.x" document was not showing any connections in the graph visualization, despite having substantial content (7,221 chars) and multiple related Goose documents in the database.

## Root Cause
The `get_similarity_score()` method in `brian/services/similarity.py` was building a **mini-index with only 2 documents** each time it was called. This caused incorrect IDF (Inverse Document Frequency) calculations:

```python
# BEFORE (Broken):
def get_similarity_score(self, item1: Dict, item2: Dict) -> float:
    # ...
    # Build mini-index for just these two documents
    docs = [tokens1, tokens2]
    idf = self.compute_idf(docs)  # ❌ Wrong! IDF based on only 2 docs
```

**Why this broke similarity:**
- IDF formula: `log(total_docs / docs_containing_term)`
- With 2 documents: For any shared term, IDF = `log(2/2)` = `log(1)` = **0**
- TF-IDF = TF × IDF = TF × **0** = **0**
- Cosine similarity with all-zero vectors = **0%**

## Solution
Modified `get_similarity_score()` to use the pre-built index from `build_index()` when available:

```python
# AFTER (Fixed):
def get_similarity_score(self, item1: Dict, item2: Dict) -> float:
    # ...
    # Use pre-built IDF scores if available
    if self.idf_scores:
        idf = self.idf_scores  # ✅ Correct! IDF based on all documents
    else:
        # Fallback: Build mini-index for just these two documents
        docs = [tokens1, tokens2]
        idf = self.compute_idf(docs)
```

## Results

### Before Fix:
```
Connections at 0.15: 0
Connections at 0.10: 0
Connections at 0.05: 0
❌ Will NOT show in graph
```

### After Fix:
```
Connections at 0.15: 3
Connections at 0.10: 4
Connections at 0.05: 5
✅ WILL SHOW IN GRAPH with 3 connections!

Top connections:
1. ✅ 0.2063 - goose: Adaptive UI II
2. ✅ 0.1721 - goose: 2.0
3. ✅ 0.1578 - goose: Adaptive UI I
4. ⚠️ 0.1158 - g2 - Ecosystem
5. ❌ 0.0512 - g2: Sharing and Collaboration
```

## Additional Fixes

### Updated Google Docs Content
Several Google Docs were stored as stubs with only placeholder text (35-110 chars). Updated with actual content:

| Document | Before | After | Status |
|----------|--------|-------|--------|
| goose: Adaptive UI I | 110 chars | 5,695 chars | ✅ Updated |
| goose: Adaptive UI II | 102 chars | 2,461 chars | ✅ Updated |
| goose: 2.0 | 49 chars | 3,037 chars | ✅ Updated |
| Codename Goose 1.2.x | 7,221 chars | 7,221 chars | ✅ Already had content |

### Remaining Stub Documents
These still need their full content fetched from Google Docs:
- goose: tab'd instance & BYO Navigations (35 chars)
- goose: Reeds vs Metcalfe (35 chars)
- Multi-Instance Goose: Agentic OS Research (35 chars)
- Goose UI/UX Design Notes (35 chars)
- Commerce Future & Goose Build Commands (35 chars)
- Notes with Petersen - Goose Focus (35 chars)
- Goose Recipes - Local Context (35 chars)
- Goose Memory Management - Aaron (35 chars)
- Goose Mobile Router & Multi-Chat (35 chars)

## Impact
- ✅ Graph visualization now works correctly
- ✅ Documents with related content show connections
- ✅ Similarity scores are accurate and meaningful
- ✅ Users can discover related documents through the graph

## Testing
To verify the fix works:

```bash
cd /Users/spencermartin/brian
python3 -c "
from brian.database.connection import Database
from brian.database.repository import KnowledgeRepository
from brian.services.similarity import SimilarityService

db = Database('/Users/spencermartin/.brian/brian.db')
repo = KnowledgeRepository(db)
sim = SimilarityService()

items = repo.get_all()
items_dict = [{'id': i.id, 'title': i.title, 'content': i.content, 'tags': i.tags or []} for i in items]

sim.build_index(items_dict)

# Test specific document
target = items_dict[0]
score = sim.get_similarity_score(target, items_dict[1])
print(f'Similarity: {score:.4f}')
"
```

## Files Modified
- `brian/services/similarity.py` - Fixed `get_similarity_score()` method
- Database records updated for 3 Google Docs with full content

## Date
2026-01-20

## Status
✅ **RESOLVED** - Graph visualization now working correctly
