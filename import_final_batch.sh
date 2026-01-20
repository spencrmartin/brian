#!/bin/bash

echo "Importing final batch of Google Drive documents..."

# Document 29: SwiftUI NodeMatrix Code
echo "Processing: SwiftUI NodeMatrix Implementation"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SwiftUI NodeMatrix Implementation with Grape",
    "content": "Complete SwiftUI implementation of NodeMatrix view using Grape force-directed graph library, featuring semantic linking, chronological connections, node sizing based on message count, and day-based navigation with swipe gestures.",
    "summary": "SwiftUI code for NodeMatrix visualization component using Grape library for force-directed graphs with semantic word matching, chronological links, and interactive node navigation.",
    "url": "https://docs.google.com/document/d/1mbsW39dWpL3Y0Hsw1nc2Kt0ta7thIH5nsrF6vF3J9A0/edit",
    "item_type": "code",
    "tags": ["SwiftUI", "code", "NodeMatrix", "Grape", "visualization", "graph"]
  }'
echo ""

# Document 30: Goose Multiplayer Vision
echo "Processing: Goose Multiplayer Vision Notes"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Goose Multiplayer Vision - OSS Opportunity",
    "content": "Strategic notes on Goose transitioning from single-player to multiplayer, vision for replacing Slack with agent-based communication, living side-by-side with agents, and network participation without technical knowledge.",
    "summary": "Vision notes on Goose evolution to multiplayer platform with agents having different expertise areas, delegating work, and communicating across channels beyond Goose and Slack.",
    "url": "https://docs.google.com/document/d/18VWbDM_mQ5KPlroFmt-yM7Nv05KUJVki890Zr4CsWSU/edit",
    "item_type": "note",
    "tags": ["goose", "vision", "multiplayer", "agents", "OSS", "strategy"]
  }'
echo ""

# Document 31: G2 Design Experience Reflection
echo "Processing: G2 Design Experience & AI Tool Adoption"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "G2 Design Experience & AI Tool Adoption Challenges",
    "content": "Reflection on working with g2 as experimental AI tool experience, discussing need for designers to have space for onboarding, gaining competency, and building confidence with AI tools amidst heavy workloads.",
    "summary": "Note on g2 design experience and the challenge of communicating to cross-functional partners that designers need time to learn and experiment with AI tools.",
    "url": "https://docs.google.com/document/d/1YeZ_gDe39dKRCv1lMB8IT0ig4N8nLKWxNUdML4-TS3E/edit",
    "item_type": "note",
    "tags": ["g2", "design", "AI", "tools", "adoption", "reflection"]
  }'
echo ""

# Document 32: G2 QA Testing Session Guide
echo "Processing: G2 QA Testing Session Guide"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "G2 PreBxB QA Testing Session Guide",
    "content": "Guide for open QA testing sessions before g2 launch, including instructions for creating test spaces, documenting findings, and using comprehensive testing guides.",
    "summary": "QA session guide for g2 pre-launch testing with instructions for participants to test features and document issues.",
    "url": "https://docs.google.com/document/d/1HmEk30Ag3y4HVQgxuHR7l4D_u3X3JtPtNXLZFPN3V2Q/edit",
    "item_type": "note",
    "tags": ["g2", "QA", "testing", "launch", "guide"]
  }'
echo ""

# Document 33: Memory Management Notes with Aaron
echo "Processing: Goose Memory Management Discussion with Aaron"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Goose Memory Management - Notes with Aaron",
    "content": "Discussion notes on memory extension management, global vs project memory, memory editing/deletion, memory management UI needs, local memory for directories, and using memory files for PR explanations.",
    "summary": "Meeting notes discussing Goose memory management challenges and design ideas for global memory, project memory, and local memory contexts.",
    "url": "https://docs.google.com/document/d/1bhZRrJKG_ksebQIYmS0n9DmoqLbh6RE2s2n04uow118/edit",
    "item_type": "note",
    "tags": ["goose", "memory", "management", "meeting", "design"]
  }'
echo ""

# Document 34: Low-Effort QA Strategy
echo "Processing: Low-Effort QA Strategy for G2"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Low-Effort QA Strategy for G2",
    "content": "Comprehensive QA strategy document covering smoke testing, user journey testing, exploratory testing, data quality, performance monitoring, feedback loops, risk-based prioritization, and implementation roadmap with low-cost tools.",
    "summary": "Practical low-effort quality assurance strategies for G2 including smoke tests, user journey testing, and risk-based prioritization without significant resource investment.",
    "url": "https://docs.google.com/document/d/1-R3SRRakWCW5B5kQsAjfwB4piDeMb_dMPObn4qMBtgU/edit",
    "item_type": "paper",
    "tags": ["g2", "QA", "testing", "strategy", "quality-assurance"]
  }'
echo ""

# Document 35: Goose Recipes & Local Context
echo "Processing: Goose Recipes & Local Repository Context"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Goose Recipes - Local Context & Shareability Improvements",
    "content": "Discussion on improving Goose recipes for iOS Register repo work, local recipe repositories, recipe editing challenges, team sharing workflows, PR-style review for recipe changes, and managing different project contexts.",
    "summary": "Notes on improving Goose recipes with local .goose/recipe folders, better editing UI, team shareability, iterative improvement workflows, and project-specific context management.",
    "url": "https://docs.google.com/document/d/1DJVGWNZKnRHgc9ntaZEP8G_YPmzUVfSeczS0I672hdE/edit",
    "item_type": "note",
    "tags": ["goose", "recipes", "local-context", "sharing", "improvements"]
  }'
echo ""

echo "Final batch import complete! Imported 7 additional documents."
echo ""
echo "=== IMPORT SUMMARY ==="
echo "Total documents imported across all batches: 35+"
echo "Categories:"
echo "  - G2 Design & Strategy: 8 documents"
echo "  - Goose Platform & Vision: 17 documents"
echo "  - Code & Implementation: 1 document"
echo "  - Meeting Notes & Ideas: 9 documents"
echo ""
echo "All documents are now searchable in Brian with proper titles, summaries, and tags!"
