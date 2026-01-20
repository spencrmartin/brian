#!/bin/bash

echo "=== Complete Import with Correct Google Drive Creation Dates ==="
echo ""

# Based on CREATE events from Google Drive activity data
# All documents verified as owner:me

# Batch 2: Goose Platform Documents
curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "g2 - Design: Public Launch",
  "content": "Comprehensive design brief for g2 public launch covering core features (notes, task management, media, finance, calendar, home automation), MCP strategy, privacy controls, and user flow refinements.",
  "url": "https://docs.google.com/document/d/1HjX2l6FOCXyffWUpv-ajv1MthT7gOknrGF3EO8JFjX8/edit",
  "item_type": "paper",
  "tags": ["g2", "design", "launch", "features"],
  "created_at": "2025-10-21T20:08:01Z"
}' | jq -r '.title + " - " + .created_at'

curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "goose: 2.0",
  "content": "Vision document for Goose 2.0 platform evolution.",
  "url": "https://docs.google.com/document/d/1gKiL-3KJvkfyBv1IkcHTO8xIfj0ix_6zaKVI0xc9A8w/edit",
  "item_type": "paper",
  "tags": ["goose", "platform", "vision"],
  "created_at": "2025-08-12T14:20:00Z"
}' | jq -r '.title + " - " + .created_at'

curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "goose: Adaptive UI I",
  "content": "Foundational adaptive UI concepts exploring how Goose interface responds to user context and cognitive states.",
  "url": "https://docs.google.com/document/d/14LS_qUEWru_gmUcfthIYg59IctQz0j6TtVKOPxNGT-w/edit",
  "item_type": "paper",
  "tags": ["goose", "UI", "adaptive", "design"],
  "created_at": "2025-05-08T13:08:00Z"
}' | jq -r '.title + " - " + .created_at'

curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "goose: Adaptive UI II",
  "content": "Advanced adaptive UI patterns and implementations for Goose, building on initial adaptive UI concepts.",
  "url": "https://docs.google.com/document/d/1eK9xtsn1vnvZQja9RsTDStiY5IBhGGmMpjhaPxuRKbs/edit",
  "item_type": "paper",
  "tags": ["goose", "UI", "adaptive", "design"],
  "created_at": "2025-05-12T20:01:00Z"
}' | jq -r '.title + " - " + .created_at'

curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "Research Paper Assistant Agent Instructions",
  "content": "Complete instruction set for an AI agent designed to assist researchers throughout the entire academic paper writing process.",
  "url": "https://docs.google.com/document/d/1de-z-5RwV-myDJygRWiD4uKhQlj_7rHgvisL1_iQg4Y/edit",
  "item_type": "paper",
  "tags": ["AI", "agent", "research", "academic-writing"],
  "created_at": "2025-09-15T10:00:00Z"
}' | jq -r '.title + " - " + .created_at'

echo ""
echo "=== Import Complete ==="
curl -s http://localhost:8080/api/v1/stats | jq '{total_items, by_type}'

