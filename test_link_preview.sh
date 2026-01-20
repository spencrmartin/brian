#!/bin/bash

# Test adding a link with rich preview metadata

curl -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "OpenAI GPT-4 Technical Report",
    "content": "Technical report detailing the architecture, capabilities, and limitations of GPT-4",
    "item_type": "link",
    "url": "https://arxiv.org/abs/2303.08774",
    "tags": ["AI", "GPT-4", "research", "OpenAI"],
    "link_title": "GPT-4 Technical Report",
    "link_description": "We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs.",
    "link_image": "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png",
    "link_site_name": "arXiv.org"
  }'

echo ""
echo "✅ Link added! Check your timeline and feed views to see the rich preview card."
