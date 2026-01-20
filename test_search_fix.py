#!/usr/bin/env python3
"""Test the search fix"""

import sys
sys.path.insert(0, '/Users/spencermartin/brian')

from brian.database.connection import Database
from brian.database.repository import KnowledgeRepository

db = Database('/Users/spencermartin/.brian/brian.db')
repo = KnowledgeRepository(db)

# Test search
print("Testing search...")
results = repo.search('design', limit=5)
print(f'Found {len(results)} results:')
for item in results:
    print(f'  - {item.title}')

if len(results) > 0:
    print("\n✅ Search is working!")
else:
    print("\n❌ Search returned 0 results")
