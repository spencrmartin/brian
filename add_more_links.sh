#!/bin/bash

# Add more inspiring links with rich preview metadata

echo "Adding inspiring links..."

# Link 1: Attention Is All You Need
curl -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Attention Is All You Need",
    "content": "The transformer architecture paper that revolutionized NLP and deep learning",
    "item_type": "link",
    "url": "https://arxiv.org/abs/1706.03762",
    "tags": ["AI", "transformers", "research", "NLP"],
    "link_title": "Attention Is All You Need",
    "link_description": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer.",
    "link_image": "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png",
    "link_site_name": "arXiv.org"
  }' > /dev/null 2>&1

echo "✓ Added: Attention Is All You Need"

# Link 2: React Documentation
curl -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React - The library for web and native user interfaces",
    "content": "Official React documentation for building modern web applications",
    "item_type": "link",
    "url": "https://react.dev/",
    "tags": ["React", "JavaScript", "web-development", "frontend"],
    "link_title": "React",
    "link_description": "The library for web and native user interfaces",
    "link_image": "https://react.dev/images/og-home.png",
    "link_site_name": "React"
  }' > /dev/null 2>&1

echo "✓ Added: React Documentation"

# Link 3: Tailwind CSS
curl -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tailwind CSS - Rapidly build modern websites",
    "content": "A utility-first CSS framework for rapidly building custom user interfaces",
    "item_type": "link",
    "url": "https://tailwindcss.com/",
    "tags": ["CSS", "Tailwind", "web-development", "design"],
    "link_title": "Tailwind CSS - Rapidly build modern websites without ever leaving your HTML",
    "link_description": "A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
    "link_image": "https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg",
    "link_site_name": "Tailwind CSS"
  }' > /dev/null 2>&1

echo "✓ Added: Tailwind CSS"

# Link 4: D3.js
curl -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "D3.js - Data-Driven Documents",
    "content": "JavaScript library for producing dynamic, interactive data visualizations",
    "item_type": "link",
    "url": "https://d3js.org/",
    "tags": ["D3", "JavaScript", "data-visualization", "charts"],
    "link_title": "D3.js - Data-Driven Documents",
    "link_description": "D3 is a JavaScript library for visualizing data with HTML, SVG, and CSS.",
    "link_image": "https://d3js.org/logo.png",
    "link_site_name": "D3.js"
  }' > /dev/null 2>&1

echo "✓ Added: D3.js"

# Link 5: FastAPI
curl -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "FastAPI - Modern, fast web framework for Python",
    "content": "FastAPI framework for building APIs with Python 3.7+ based on standard Python type hints",
    "item_type": "link",
    "url": "https://fastapi.tiangolo.com/",
    "tags": ["Python", "FastAPI", "API", "backend"],
    "link_title": "FastAPI",
    "link_description": "FastAPI framework, high performance, easy to learn, fast to code, ready for production",
    "link_image": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png",
    "link_site_name": "FastAPI"
  }' > /dev/null 2>&1

echo "✓ Added: FastAPI"

echo ""
echo "🎉 Successfully added 5 inspiring links with rich preview cards!"
echo "Check your Feed and Timeline views to see them in action."
