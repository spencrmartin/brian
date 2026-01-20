#!/usr/bin/env python3
"""
Script to update Brian knowledge items with full Google Docs content
"""
import sys
sys.path.insert(0, '.')

from brian.database.connection import Database
from brian.database.repository import KnowledgeRepository
from brian.models.knowledge_item import ItemType

# Documents to update with their IDs and full content
updates = [
    {
        'id': '651522c4-00dc-4d5e-a8dc-8b448bb12e10',
        'title': 'goose: Adaptive UI II',
        'content': '''Codename Goose - Adaptive UIs II
Productivity enhancements through adaptive UIs centred around specific user preferences, profiles, thinking and doing.

Why this matters: The evolution of workplace technology has reached an inflection point where static, one-size-fits-all interfaces fundamentally misalign with the dynamic, individualized nature of modern knowledge work. This work examines how adaptive user interfaces (UIs) that respond to specific job profiles in technology environments can unlock significant productivity gains by meeting users where they are, rather than forcing them into prescribed workflows.

The Fallacy of Universal Workflows: Organizations often approach productivity enhancement through standardization—creating workflows that all employees must follow. However, research in human-computer interaction consistently demonstrates that forcing users into predetermined patterns creates friction that undermines productivity.

Understanding Job Profiles in Tech Environments:
- Engineers: Sequential, logical thinking patterns, preference for detailed technical documentation
- Designers/Creatives: Visual-spatial reasoning dominance, iterative exploratory work patterns
- Scientists: Statistical and probabilistic thinking, hypothesis-driven exploration
- Managers: Rapid context switching, aggregation and synthesis of diverse information

Adaptive UI Principles:
1. Flow State Recognition: Systems must accurately identify user cognitive states through interaction patterns
2. Progressive Complexity: Interface density scales with detected user needs
3. Predictive Adaptation: Changes anticipate user needs rather than reacting
4. Selective Adaptation: Changes occur only when benefits outweigh disruption

Designing for Cognitive Modes:
- Exploration Mode: Expanded tool visibility, rich contextual assistance for discovery
- Focus Mode: Minimized distractions, streamlined interactions for deep work
- Review Mode: Enhanced context visibility, annotation capabilities for analysis

Implementation Framework:
1. State Detection System: Interaction patterns, environmental context, historical patterns
2. Adaptation Rules Engine: Value thresholds, timing windows, user preferences
3. Continuous Learning: Pattern recognition, feedback integration, performance tracking

The research demonstrates that adaptive interfaces can improve task completion rates by 43%, reduce cognitive load by 27%, and extend flow state duration by 47%.'''
    }
]

def main():
    db = Database('/Users/spencermartin/.brian/brian.db')
    repo = KnowledgeRepository(db)
    
    for update_data in updates:
        item_id = update_data['id']
        item = repo.get_by_id(item_id)
        
        if item:
            old_len = len(item.content)
            item.content = update_data['content']
            item.item_type = ItemType.PAPER
            updated = repo.update(item)
            print(f"✅ Updated: {updated.title}")
            print(f"   Old: {old_len} chars → New: {len(updated.content)} chars")
        else:
            print(f"❌ Item not found: {item_id}")

if __name__ == '__main__':
    main()
