# Skills Integration Testing Strategy

## Overview
Comprehensive testing plan for Anthropic skills integration into Brian.

---

## Phase 1: CLI Testing ✅ (COMPLETE)

### Test 1.1: List Skills
```bash
cd /Users/spencermartin/Desktop/brian
source venv/bin/activate
python -m brian.skills.cli list
```

**Expected**: 
- List of 16 skills from Anthropic repository
- Each skill shows name and GitHub URL
- No errors or rate limiting issues

**Status**: ✅ PASSED

### Test 1.2: Fetch Skill Details
```bash
python -m brian.skills.cli fetch skill-creator
python -m brian.skills.cli fetch mcp-builder
python -m brian.skills.cli fetch algorithmic-art
```

**Expected**:
- YAML frontmatter parsed correctly (name, description, license)
- Bundled resources listed (scripts/, references/, assets/)
- Content preview shown (first 500 chars)
- No parsing errors

**Status**: ✅ PASSED (skill-creator)

### Test 1.3: Import Single Skill
```bash
python -m brian.skills.cli import skill-creator
```

**Expected**:
- Skill fetched from GitHub
- Converted to KnowledgeItem with type=SKILL
- Stored in database with skill_metadata JSON
- Returns item ID
- Tags: ['skill', 'anthropic']

**Status**: ⏳ TODO

### Test 1.4: Import All Skills
```bash
python -m brian.skills.cli import-all
```

**Expected**:
- All 16 skills imported
- Progress shown for each
- Summary: X imported, Y skipped, Z errors
- No rate limiting (or handled gracefully)

**Status**: ⏳ TODO

### Test 1.5: Duplicate Handling
```bash
python -m brian.skills.cli import skill-creator
python -m brian.skills.cli import skill-creator
```

**Expected**:
- Second import detects existing skill
- Shows warning: "Skill already exists"
- Suggests using --force flag

**Status**: ⏳ TODO

### Test 1.6: Force Reimport
```bash
python -m brian.skills.cli import skill-creator --force
```

**Expected**:
- Skill reimported and overwrites existing
- Updated timestamp
- Success message

**Status**: ⏳ TODO

---

## Phase 2: MCP Integration Testing ⏳ (IN PROGRESS)

### Test 2.1: MCP Server Loads
```bash
# Restart Goose Desktop to reload MCP server
# Check that brian extension loads without errors
```

**Expected**:
- brian_mcp.server starts successfully
- No import errors for skills module
- All tools registered (including new skills tools)

**Status**: ⏳ TODO

### Test 2.2: List Skills via MCP (from Goose)
```
In Goose conversation:
"List all available skills from Anthropic's repository"
```

**Expected**:
- Goose calls brian.list_skills tool
- Returns 16 skills with names and descriptions
- Formatted nicely in response

**Status**: ⏳ TODO

### Test 2.3: Get Skill Details via MCP
```
In Goose conversation:
"Show me details about the skill-creator skill"
```

**Expected**:
- Goose calls brian.get_skill tool
- Returns full skill metadata
- Shows bundled resources
- Displays content preview

**Status**: ⏳ TODO

### Test 2.4: Search Skills via MCP
```
In Goose conversation:
"Find skills related to document creation"
"Find skills for building MCP servers"
```

**Expected**:
- Goose calls brian.search_skills tool
- Returns relevant skills (docx, pptx, doc-coauthoring)
- Ranked by relevance

**Status**: ⏳ TODO

### Test 2.5: Import Skill via MCP
```
In Goose conversation:
"Import the mcp-builder skill into Brian"
```

**Expected**:
- Goose calls brian.import_skill tool
- Skill fetched and imported
- Returns success with item ID
- Skill now searchable in Brian

**Status**: ⏳ TODO

### Test 2.6: Use Imported Skill
```
In Goose conversation:
"Search my knowledge base for MCP skills"
```

**Expected**:
- brian.search_knowledge finds imported skill
- Returns skill with type='skill'
- Full content accessible

**Status**: ⏳ TODO

---

## Phase 3: Frontend Integration Testing ⏳ (TODO)

### Test 3.1: Skills Appear in Search
1. Open Brian UI at http://localhost:5173/
2. Search for "skill"
3. Verify imported skills appear in results
4. Check skill badge/icon distinguishes them

**Expected**:
- Skills show up in search results
- Visual indicator (badge, icon, or color)
- Click opens skill detail view

**Status**: ⏳ TODO

### Test 3.2: Skill Detail View
1. Click on an imported skill
2. View detail sheet

**Expected**:
- Title: "Skill: skill-creator"
- Content: Full SKILL.md markdown rendered
- Metadata section shows:
  - Name, description, license
  - Source URL (link to GitHub)
  - Bundled resources list
- Tags: ['skill', 'anthropic']

**Status**: ⏳ TODO

### Test 3.3: Skills in Knowledge Graph
1. Open graph view
2. Look for skill nodes

**Expected**:
- Skills appear as nodes
- Different visual style (color, shape, or icon)
- Connected to related items via similarity
- Hovering shows skill metadata

**Status**: ⏳ TODO

### Test 3.4: Filter by Skill Type
1. Use filter dropdown
2. Select "Skills" type

**Expected**:
- Only skill items shown
- Count matches imported skills
- Can combine with other filters (tags, projects)

**Status**: ⏳ TODO

---

## Phase 4: Database & Data Integrity Testing ⏳ (TODO)

### Test 4.1: Schema Migration
```bash
# On a fresh database
cd /Users/spencermartin/Desktop/brian
rm ~/.brian/brian.db
python -m brian.main  # Start backend to trigger migration
```

**Expected**:
- Database created with schema v7
- skill_metadata column exists
- No migration errors

**Status**: ⏳ TODO

### Test 4.2: Skill Metadata Storage
```sql
-- Check skill metadata in database
sqlite3 ~/.brian/brian.db
SELECT id, title, item_type, skill_metadata FROM knowledge_items WHERE item_type = 'skill' LIMIT 1;
```

**Expected**:
- skill_metadata is valid JSON
- Contains: name, description, license, source_url, bundled_resources
- bundled_resources has scripts, references, assets arrays

**Status**: ⏳ TODO

### Test 4.3: Full-Text Search on Skills
```sql
SELECT * FROM knowledge_search WHERE content MATCH 'skill creator';
```

**Expected**:
- Skill content indexed in FTS
- Search returns skill item_id
- Ranking works correctly

**Status**: ⏳ TODO

---

## Phase 5: Error Handling & Edge Cases ⏳ (TODO)

### Test 5.1: GitHub API Rate Limiting
```bash
# Make 60+ requests without token
for i in {1..65}; do
  python -m brian.skills.cli list
done
```

**Expected**:
- First 60 succeed
- 61st shows rate limit error
- Error message suggests using --github-token
- Graceful failure (no crash)

**Status**: ⏳ TODO

### Test 5.2: Network Failure
```bash
# Disconnect network
python -m brian.skills.cli list
```

**Expected**:
- Clear error message: "Network error: ..."
- No crash or stack trace
- Suggests checking connection

**Status**: ⏳ TODO

### Test 5.3: Invalid Skill Name
```bash
python -m brian.skills.cli fetch nonexistent-skill
```

**Expected**:
- Error: "Failed to fetch skill 'nonexistent-skill'"
- 404 error from GitHub
- Graceful failure

**Status**: ⏳ TODO

### Test 5.4: Malformed SKILL.md
```bash
# Test with a skill that has invalid YAML
# (Would need to mock or test with local file)
```

**Expected**:
- YAML parsing error caught
- Fallback to treating entire file as content
- Warning logged

**Status**: ⏳ TODO

### Test 5.5: Database Locked
```bash
# Open database in another process
sqlite3 ~/.brian/brian.db
# Then try to import
python -m brian.skills.cli import skill-creator
```

**Expected**:
- Retry logic or clear error
- No data corruption
- Graceful failure

**Status**: ⏳ TODO

---

## Phase 6: Performance Testing ⏳ (TODO)

### Test 6.1: Import All Skills Performance
```bash
time python -m brian.skills.cli import-all
```

**Expected**:
- Completes in < 2 minutes (for 16 skills)
- No memory leaks
- Database size reasonable (~1-2 MB)

**Status**: ⏳ TODO

### Test 6.2: Search Performance with Skills
```bash
# After importing all skills
python -m brian.skills.cli import-all

# Then search
time python -c "
from brian.database.connection import Database
from brian.database.repository import KnowledgeRepository
db = Database()
repo = KnowledgeRepository(db.connect())
results = repo.search('skill')
print(f'Found {len(results)} results')
"
```

**Expected**:
- Search completes in < 100ms
- Returns all skill items
- No performance degradation

**Status**: ⏳ TODO

---

## Phase 7: Integration Testing ⏳ (TODO)

### Test 7.1: End-to-End Workflow
1. Start fresh (clean database)
2. List skills via Goose
3. Import mcp-builder skill via Goose
4. Search for MCP in Brian UI
5. View skill in graph
6. Use skill content to build something

**Expected**:
- Seamless workflow
- All components work together
- Data consistent across CLI, MCP, and UI

**Status**: ⏳ TODO

### Test 7.2: Multi-Project Skills
```bash
# Create new project
# Import skills to specific project
python -m brian.skills.cli import skill-creator --project-id <project-id>
```

**Expected**:
- Skill added to specified project
- Scoped searches work
- Project isolation maintained

**Status**: ⏳ TODO

---

## Test Execution Checklist

### Quick Smoke Test (5 minutes)
- [ ] List skills via CLI
- [ ] Fetch one skill details
- [ ] Import one skill
- [ ] Verify in database
- [ ] Search via MCP (if available)

### Full Test Suite (30 minutes)
- [ ] All Phase 1 tests (CLI)
- [ ] All Phase 2 tests (MCP)
- [ ] Database integrity checks
- [ ] Basic error handling

### Comprehensive Test (1-2 hours)
- [ ] All phases
- [ ] Performance benchmarks
- [ ] Edge cases
- [ ] End-to-end workflows

---

## Test Data Cleanup

After testing:
```bash
# Remove test skills from database
sqlite3 ~/.brian/brian.db "DELETE FROM knowledge_items WHERE item_type = 'skill';"

# Or reset entire database
rm ~/.brian/brian.db
```

---

## Known Issues / Future Tests

1. **Skill Versioning**: Test updating skills when source changes
2. **Bundled Resource Downloads**: Actually download and store scripts/references
3. **Skill Templates**: Test using skill templates to create new items
4. **Skill Workflows**: Chain multiple skills together
5. **Custom Skills**: Test creating user-defined skills

---

## Success Criteria

### Phase 1 (CLI) ✅
- [x] Can list all skills
- [x] Can fetch skill details
- [ ] Can import skills
- [ ] Skills stored correctly in database

### Phase 2 (MCP)
- [ ] Skills accessible via Goose
- [ ] Can import skills through conversation
- [ ] Skills searchable via MCP

### Phase 3 (Frontend)
- [ ] Skills visible in UI
- [ ] Skill detail view works
- [ ] Skills in knowledge graph

### Phase 4 (Production Ready)
- [ ] All error cases handled
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Tests passing
