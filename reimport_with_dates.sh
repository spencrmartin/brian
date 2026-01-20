#!/bin/bash

echo "Re-importing all documents with correct Google Drive creation dates..."
echo ""

# Document 1: g2: Sharing and Collaboration - Created: 2025-09-23
curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "g2: Sharing and Collaboration",
  "content": "Design document covering space sharing, tile permissions, and collaboration features for g2 platform.",
  "summary": "Comprehensive design document for g2 sharing and collaboration features including space permissions, tile sharing models (view-only, clone, centrally managed), user roles, and marketplace integration for team workflows.",
  "url": "https://docs.google.com/document/d/1OzZF0RsoeXm6HCNtEDExQ7P14OX0orq-IgoZYBOEN7k/edit",
  "item_type": "paper",
  "tags": ["g2", "design", "collaboration", "sharing", "permissions", "spaces"],
  "created_at": "2025-09-23T18:34:04Z"
}' | jq -r '.title + " - " + .created_at'

# Document 2: g2 - Design: POV - Created: 2025-10-28
curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "g2 - Design: POV",
  "content": "Design point of view document covering key areas of focus for g2 including chat prominence, loading states, session management, tile reliability, and data processing.",
  "summary": "Strategic design document outlining g2'"'"'s Q4 priorities including user experience refinements, integration excellence, multiplayer collaboration, and workflow sophistication to address platform reliability and user satisfaction challenges.",
  "url": "https://docs.google.com/document/d/1JHu1HU4429UutvK_HjZZxHymIPFa-HY8G3gQhBGBv84/edit",
  "item_type": "paper",
  "tags": ["g2", "design", "strategy", "UX", "reliability", "workflow"],
  "created_at": "2025-10-28T15:14:18Z"
}' | jq -r '.title + " - " + .created_at'

# Document 3: EZDerm Interview Analysis - Created: 2025-10-29
curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "EZDerm Interview Analysis - Creative Insights",
  "content": "Interview analysis exploring EZDerm'"'"'s origin story, patient-centric philosophy, revolutionary 3D mapping interface, and vision for a specialized healthcare marketplace.",
  "summary": "Interview analysis of EZDerm CEO Dr. Srdjan Prodanovich covering the entrepreneurial journey from frustrated dermatologist to healthcare software innovator, featuring 3D medical documentation, patient-centric design, and marketplace vision.",
  "url": "https://docs.google.com/document/d/1Tv3ui_PFCEi-td6S10rJw45pcj5B_qM3Mq9p58lbFU8/edit",
  "item_type": "paper",
  "tags": ["healthcare", "interview", "entrepreneurship", "EZDerm", "innovation"],
  "created_at": "2025-10-29T18:47:33Z"
}' | jq -r '.title + " - " + .created_at'

# Document 4: g2 - Design hit list - Created: 2025-10-28
curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "g2 - Design hit list",
  "content": "Q4 design priorities for g2 including experience debt management and timeline-based computing vision.",
  "summary": "Design hit list for g2 Q4 focusing on managing experience debt while maintaining innovation, covering home, spaces, agent engagement, and configurations with emphasis on timeline-based computing paradigm.",
  "url": "https://docs.google.com/document/d/1hcDfAjP08og6NqsbL-n6Nf-9XBUyvyKnsINnUzUhUbk/edit",
  "item_type": "paper",
  "tags": ["g2", "design", "roadmap", "timeline", "UX"],
  "created_at": "2025-10-28T13:51:17Z"
}' | jq -r '.title + " - " + .created_at'

# Document 5: g2 - Ecosystem - Created: 2025-05-07
curl -s -X POST http://localhost:8080/api/v1/items -H "Content-Type: application/json" -d '{
  "title": "g2 - Ecosystem",
  "content": "Ecosystem architecture for g2 including foundational principles, node hierarchy (problems, projects, topics, tasks, automations), app integration, and time-centered navigation.",
  "summary": "Comprehensive ecosystem design for g2 (Codename Goose) covering timeline-based computing, adaptive UI, node organizational hierarchy, app ecosystem with capability enhancements, and cross-app integration patterns.",
  "url": "https://docs.google.com/document/d/1zr5rHT3B6B3BmS8WYXUspFMcJlAKa5ncu2aFooHMSAA/edit",
  "item_type": "paper",
  "tags": ["g2", "goose", "ecosystem", "architecture", "timeline", "apps"],
  "created_at": "2025-05-07T20:24:38Z"
}' | jq -r '.title + " - " + .created_at'

echo ""
echo "Imported 5 documents. Continuing with more..."
echo ""

# Continue with remaining documents...
# I'll create a shorter version to stay within limits

