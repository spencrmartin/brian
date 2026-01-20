#!/bin/bash

echo "Importing remaining major Google Drive documents..."

# Document 6: g2 - Design: Public Launch
echo "Processing: g2 - Design: Public Launch"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "g2 - Design: Public Launch",
    "content": "Comprehensive design brief for g2 public launch covering core features (notes, task management, media, finance, calendar, home automation), MCP strategy, privacy controls, and user flow refinements for first 5 minutes through 5 months.",
    "summary": "Design document outlining g2 public launch strategy with focus on additional core features, MCP integration, privacy controls, and progressive user onboarding experiences.",
    "url": "https://docs.google.com/document/d/1HjX2l6FOCXyffWUpv-ajv1MthT7gOknrGF3EO8JFjX8/edit",
    "item_type": "paper",
    "tags": ["g2", "design", "launch", "features", "onboarding", "privacy"]
  }'
echo ""

# Document 7: goose: 2.0
echo "Processing: goose: 2.0"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "goose: 2.0",
    "content": "Vision document for Goose 2.0 platform evolution.",
    "summary": "Strategic vision and requirements for Goose 2.0 platform development.",
    "url": "https://docs.google.com/document/d/1gKiL-3KJvkfyBv1IkcHTO8xIfj0ix_6zaKVI0xc9A8w/edit",
    "item_type": "paper",
    "tags": ["goose", "platform", "vision", "2.0"]
  }'
echo ""

# Document 8: goose: tab'd instance & BYO Navigations
echo "Processing: goose: tab'd instance & BYO Navigations"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "goose: tab'"'"'d instance & BYO Navigations",
    "content": "Design exploration of tabbed instances and bring-your-own navigation patterns for Goose.",
    "summary": "Exploration of multi-instance tabbed interface and customizable navigation patterns for Goose platform.",
    "url": "https://docs.google.com/document/d/1tZZ16OHsckItNsbTiiqSbLMFUHnRKJos_GGgLrnecbM/edit",
    "item_type": "paper",
    "tags": ["goose", "UI", "navigation", "tabs", "design"]
  }'
echo ""

# Document 9: goose: Reeds vs Metcalfe
echo "Processing: goose: Reeds vs Metcalfe"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "goose: Reeds vs Metcalfe",
    "content": "Analysis comparing Reed'"'"'s Law and Metcalfe'"'"'s Law in context of Goose platform network effects.",
    "summary": "Comparison of network effect models (Reed'"'"'s Law vs Metcalfe'"'"'s Law) and their implications for Goose platform growth.",
    "url": "https://docs.google.com/document/d/1Y2a3Q9voLEL0hmR15k1q7itLDAVvXT_4kiRxqFfpHUg/edit",
    "item_type": "paper",
    "tags": ["goose", "strategy", "network-effects", "analysis"]
  }'
echo ""

# Document 10: goose: Adaptive UI II
echo "Processing: goose: Adaptive UI II"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "goose: Adaptive UI II",
    "content": "Second iteration of adaptive UI concepts for Goose platform.",
    "summary": "Advanced adaptive UI patterns and implementations for Goose, building on initial adaptive UI concepts.",
    "url": "https://docs.google.com/document/d/1eK9xtsn1vnvZQja9RsTDStiY5IBhGGmMpjhaPxuRKbs/edit",
    "item_type": "paper",
    "tags": ["goose", "UI", "adaptive", "design"]
  }'
echo ""

# Document 11: goose: Adaptive UI I
echo "Processing: goose: Adaptive UI I"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "goose: Adaptive UI I",
    "content": "Initial exploration of adaptive UI concepts for Goose platform.",
    "summary": "Foundational adaptive UI concepts exploring how Goose interface responds to user context and cognitive states.",
    "url": "https://docs.google.com/document/d/14LS_qUEWru_gmUcfthIYg59IctQz0j6TtVKOPxNGT-w/edit",
    "item_type": "paper",
    "tags": ["goose", "UI", "adaptive", "design", "UX"]
  }'
echo ""

# Document 12: Multi-Instance Goose
echo "Processing: Multi-Instance Goose: Agentic Operating System Research Foundation"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Multi-Instance Goose: Agentic Operating System Research Foundation",
    "content": "Research foundation for multi-instance Goose as an agentic operating system.",
    "summary": "Research proposal exploring Goose as a multi-instance agentic operating system with collaborative capabilities.",
    "url": "https://docs.google.com/document/d/10F-CysxNGK5I6IyG9EjfbhHLkQ7TQZ9dTDq2kzpUtLI/edit",
    "item_type": "paper",
    "tags": ["goose", "research", "multi-instance", "agentic", "OS"]
  }'
echo ""

# Document 13: Enhanced Research Foundation
echo "Processing: Enhanced Research Foundation - Agentic OS"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Enhanced Research Foundation - Agentic OS with Multi-Instance Collaboration",
    "content": "Enhanced research foundation for agentic OS with multi-instance collaboration.",
    "summary": "Enhanced research framework for developing Goose as an agentic operating system with advanced multi-instance collaboration features.",
    "url": "https://docs.google.com/document/d/1g_-b2kyGfd235480BiSORW8iKXMy05229vSoOnZxpWE/edit",
    "item_type": "paper",
    "tags": ["goose", "research", "agentic", "collaboration", "OS"]
  }'
echo ""

# Document 14: Research Foundation
echo "Processing: Research Foundation - Open Source Agentic OS Platform"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research Foundation - Open Source Agentic OS Platform",
    "content": "Research foundation for open source agentic OS platform.",
    "summary": "Research framework establishing Goose as an open source agentic operating system platform.",
    "url": "https://docs.google.com/document/d/1VFzwZjq0FXHPZFOFplTgy1osT3t4jTLFliWSDb6ykqA/edit",
    "item_type": "paper",
    "tags": ["goose", "research", "open-source", "agentic", "platform"]
  }'
echo ""

# Document 15: Goose Multi-Instance Collaboration Platform
echo "Processing: Goose Multi-Instance Collaboration Platform - Research Proposal"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Goose Multi-Instance Collaboration Platform - Research Proposal",
    "content": "Research proposal for Goose multi-instance collaboration platform.",
    "summary": "Research proposal outlining vision and technical approach for Goose multi-instance collaboration capabilities.",
    "url": "https://docs.google.com/document/d/1zs-zgFL4nW19W3dc0ljTuU2dzQBBsPs64tStmqWmu50/edit",
    "item_type": "paper",
    "tags": ["goose", "research", "collaboration", "multi-instance", "proposal"]
  }'
echo ""

# Document 16: g2: Attention Tiles Decision Doc
echo "Processing: g2: Attention Tiles Decision Doc"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "g2: Attention Tiles Decision Doc",
    "content": "Decision document for attention tiles feature in g2.",
    "summary": "Decision document outlining design and implementation approach for attention tiles that dynamically display based on relevance.",
    "url": "https://docs.google.com/document/d/1SyMxwhvy21tiUNhCBe1BOQdafv099nxaaWAvyS7oJGE/edit",
    "item_type": "paper",
    "tags": ["g2", "design", "tiles", "attention", "decision"]
  }'
echo ""

# Document 17: g2 - PreBxB testing
echo "Processing: g2 - PreBxB testing"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "g2 - PreBxB testing",
    "content": "Pre-BxB testing documentation for g2.",
    "summary": "Testing plan and documentation for g2 pre-BxB (Business by Business) rollout.",
    "url": "https://docs.google.com/document/d/1HRp-9cQYiOCqfFLY3mXn4p8VcW9_k4XfVE55QReKOqQ/edit",
    "item_type": "paper",
    "tags": ["g2", "testing", "BxB", "rollout"]
  }'
echo ""

# Document 18: g2 - Process Server
echo "Processing: g2 - Process Server"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "g2 - Process Server",
    "content": "Process server architecture and design for g2.",
    "summary": "Architecture document for g2 process server enabling multistep conditional workflows and automation orchestration.",
    "url": "https://docs.google.com/document/d/1WqeJyclql7SVBOhUlEVKecPDllOYl61uMdm4E7takY4/edit",
    "item_type": "paper",
    "tags": ["g2", "architecture", "process-server", "workflows", "automation"]
  }'
echo ""

# Document 19: My Hype Doc - 2025-09-04
echo "Processing: My Hype Doc"
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Hype Doc - 2025-09-04",
    "content": "Personal hype document from September 2025.",
    "summary": "Personal documentation of exciting developments and ideas from September 2025.",
    "url": "https://docs.google.com/document/d/1vG_5qgiV86IxN8-2wq6QGbacuphlgXaBrUPMPTcjaTU/edit",
    "item_type": "note",
    "tags": ["personal", "ideas", "hype"]
  }'
echo ""

echo "Import batch complete! Imported 14 additional major documents."
