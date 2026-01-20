#!/bin/bash

echo "Importing batch 3 of Google Drive documents..."

# Document 20: Research Paper Assistant Agent
echo "Processing: Research Paper Assistant Agent Instructions"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research Paper Assistant Agent Instructions",
    "content": "Comprehensive agent instructions for assisting researchers in writing academic papers, covering planning, literature review, writing support, citation management, structure, ethics, revision, and journal submission guidance.",
    "summary": "Complete instruction set for an AI agent designed to assist researchers throughout the entire academic paper writing process, from initial planning through final submission.",
    "url": "https://docs.google.com/document/d/1de-z-5RwV-myDJygRWiD4uKhQlj_7rHgvisL1_iQg4Y/edit",
    "item_type": "paper",
    "tags": ["AI", "agent", "research", "academic-writing", "instructions", "assistant"]
  }'
echo ""

# Document 21: UI/UX Design Notes
echo "Processing: Goose UI/UX Design Notes"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Goose UI/UX Design Notes",
    "content": "Design notes covering menu button alignment, nav persistence, chat count issues, element rearranging, tab navigation, tooltips, and keyboard shortcuts.",
    "summary": "Collection of UI/UX design notes and issues for Goose interface improvements including navigation, chat elements, and interaction patterns.",
    "url": "https://docs.google.com/document/d/1HlRQYdoG8p7-9smq36x_FYkbRMlyHH6I-0y5zioD3TI/edit",
    "item_type": "note",
    "tags": ["goose", "UI", "UX", "design", "notes", "improvements"]
  }'
echo ""

# Document 22: Square Appointments Note
echo "Processing: Square Appointments Booking Note"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Square Appointments - Multiple Booking Spots",
    "content": "Note about manipulating Square appointments to have multiple available booking spots in the same space.",
    "summary": "Quick note on Square appointments feature for multiple concurrent bookings.",
    "url": "https://docs.google.com/document/d/1xYmwd92WVoIaBR4ekICC-KyJIXk9Hhtsjs8sY7Rjzdc/edit",
    "item_type": "note",
    "tags": ["square", "appointments", "booking", "feature"]
  }'
echo ""

# Document 23: Commerce & Goose Build Notes
echo "Processing: Commerce Future & Goose Build Commands"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Commerce Future & Goose Build Commands",
    "content": "Notes on the future of commerce defined by autonomous communities and established support systems, plus Goose rebuild commands (pkill, cargo build, just run-ui).",
    "summary": "Philosophical note on commerce future alongside technical Goose rebuild and restart commands.",
    "url": "https://docs.google.com/document/d/1UtPC2THXDC1j31EEdmgbXz6jH7fzOjXiFifDB8_yvDk/edit",
    "item_type": "note",
    "tags": ["commerce", "goose", "build", "commands", "philosophy"]
  }'
echo ""

# Document 24: Petersen Meeting Notes
echo "Processing: Notes with Petersen - Goose Focus"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Notes with Petersen - Goose Focus & Agent Visualization",
    "content": "Meeting notes covering 100% commitment to Goose focus, SwiftUI implementation, agent visualization concepts, maps/mesh networks, autonomous coding agents, and goose inbox ideas.",
    "summary": "Meeting notes discussing Goose project focus, visual implementation needs, agent swarm visualization, and inbox concepts.",
    "url": "https://docs.google.com/document/d/1pIo0nru3vEbzcQPAmcRU-b3C_b5gizIywx6V1nYpBKE/edit",
    "item_type": "note",
    "tags": ["goose", "meeting", "agents", "visualization", "SwiftUI", "inbox"]
  }'
echo ""

# Document 25: Goose Mobile Router Concept
echo "Processing: Goose Mobile Router & Multi-Chat Entities"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Goose Mobile Router & Multi-Chat Entities",
    "content": "Exploration of Goose mobile as router, Figma experimentations with multi-chat entities, thin clients/mainframes concept, empty state communications, QR code LLM connections, and alien mainframe aesthetic.",
    "summary": "Design exploration of Goose mobile architecture, multi-chat interfaces, agent communication patterns, and complex background processing visualization.",
    "url": "https://docs.google.com/document/d/1uQ3j18d6jy2GQLDF2j-fUAdpJoOubai__vcNLsgIiQ8/edit",
    "item_type": "note",
    "tags": ["goose", "mobile", "architecture", "multi-chat", "agents", "design"]
  }'
echo ""

# Document 26: Multi-Client Design Challenge
echo "Processing: Multi-Client Conversation Design Challenge"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Multi-Client Conversation Design Challenge",
    "content": "Design challenge notes on conversation vs chrome, dividing communications, summary generation, canvas-on-the-fly UI construction, view modes vs action modes, and platform framework decisions (Electron vs native).",
    "summary": "Design exploration of multi-client conversation interfaces, dynamic UI generation, and platform architecture decisions for Goose.",
    "url": "https://docs.google.com/document/d/1p6rKIb7L1yR8w81tB3KYdBx6xekePyL5KTTLGJ-zW4I/edit",
    "item_type": "note",
    "tags": ["goose", "design", "multi-client", "conversation", "UI", "architecture"]
  }'
echo ""

# Document 27: G2 Kickoff Reference
echo "Processing: G2 Kickoff & Space Overlaps"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "G2 Kickoff & Space Overlaps",
    "content": "Note highlighting overlaps across different spaces and common themes, with reference to G2 Kickoff presentation.",
    "summary": "Brief note on G2 space overlaps and common themes with link to kickoff presentation.",
    "url": "https://docs.google.com/document/d/1ufGfFHFbbvOnK29l_DO6FJIcCRBuRbN-Zf-SlOS_nIo/edit",
    "item_type": "note",
    "tags": ["g2", "kickoff", "spaces", "themes"]
  }'
echo ""

# Document 28: Large Fella Prompt (Satirical)
echo "Processing: Large Fella Prompt - Enterprise Slack Monitoring"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Large Fella Prompt - Enterprise-Grade Slack Thread Monitoring",
    "content": "Satirical ultra-verbose enterprise prompt for Slack thread monitoring with theatrical complexity amplification, blockchain verification, quantum encryption, and holographic visualization.",
    "summary": "Humorous over-engineered prompt demonstrating enterprise complexity theater through an absurdly detailed Slack monitoring system specification.",
    "url": "https://docs.google.com/document/d/1f3xHkZW_HXGPsy4HFmtTE-GbzCyhA6nDShzYRAKiB_8/edit",
    "item_type": "note",
    "tags": ["humor", "satire", "enterprise", "slack", "prompts", "complexity"]
  }'
echo ""

echo "Batch 3 import complete! Imported 9 additional documents."
