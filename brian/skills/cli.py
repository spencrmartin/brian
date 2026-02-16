"""
CLI tool for importing skills from Anthropic's repository
Usage: python -m brian.skills.cli [command] [options]
"""
import argparse
import sys
import json
from pathlib import Path

from brian.skills import (
    list_available_skills,
    fetch_skill,
    skill_to_knowledge_item,
    SkillImportError,
)
from brian.database.connection import Database
from brian.database.repository import KnowledgeRepository


def list_skills_command(args):
    """List all available skills"""
    try:
        print("Fetching available skills from Anthropic repository...")
        skills = list_available_skills(args.github_token)
        
        print(f"\n✨ Found {len(skills)} skills:\n")
        for skill in sorted(skills, key=lambda s: s['name']):
            print(f"  • {skill['name']}")
            print(f"    {skill['url']}")
        
        print(f"\nTo import a skill: python -m brian.skills.cli import <skill-name>")
        
    except SkillImportError as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


def fetch_skill_command(args):
    """Fetch and display skill details"""
    try:
        print(f"Fetching skill '{args.skill_name}'...")
        skill_data = fetch_skill(args.skill_name, args.github_token)
        
        print(f"\n✅ Skill: {skill_data['name']}")
        print(f"URL: {skill_data['source_url']}\n")
        
        # Display frontmatter
        print("📋 Metadata:")
        for key, value in skill_data['frontmatter'].items():
            print(f"  {key}: {value}")
        
        # Display bundled resources
        print("\n📦 Bundled Resources:")
        for resource_type, files in skill_data['bundled_resources'].items():
            if files:
                print(f"  {resource_type}/:")
                for file in files:
                    print(f"    - {file['name']}")
        
        # Display content preview
        content_preview = skill_data['content'][:500]
        if len(skill_data['content']) > 500:
            content_preview += "..."
        
        print(f"\n📄 Content Preview:\n{content_preview}\n")
        
        # Show full content if requested
        if args.full:
            print(f"\n📄 Full Content:\n{skill_data['content']}\n")
        
    except SkillImportError as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


def import_skill_command(args):
    """Import a skill into Brian's knowledge base"""
    try:
        print(f"Fetching skill '{args.skill_name}'...")
        skill_data = fetch_skill(args.skill_name, args.github_token)
        
        # Convert to knowledge item
        item_data = skill_to_knowledge_item(skill_data, args.project_id)
        
        # Connect to database
        db = Database()
        db.initialize()
        repo = KnowledgeRepository(db)
        
        # Check if skill already exists
        all_items = repo.get_all()
        existing_skills = [item for item in all_items if item.item_type.value == 'skill' and skill_data['name'] in item.title]
        
        if existing_skills and not args.force:
            print(f"⚠️  Skill '{skill_data['name']}' already exists.")
            print("Use --force to reimport and overwrite.")
            sys.exit(1)
        
        # Import skill
        print(f"Importing skill '{skill_data['name']}'...")
        
        from brian.models.knowledge_item import KnowledgeItem, ItemType
        
        skill_item = KnowledgeItem(
            title=item_data['title'],
            content=item_data['content'],
            item_type=ItemType.SKILL,
            url=item_data['url'],
            skill_metadata=item_data['skill_metadata'],
            project_id=item_data.get('project_id'),
            tags=item_data.get('tags', []),
        )
        
        # Save to database
        created_item = repo.create(skill_item)
        item_id = created_item.id
        
        print(f"✅ Successfully imported skill '{skill_data['name']}'")
        print(f"   ID: {item_id}")
        print(f"   URL: {skill_data['source_url']}")
        
        # Display bundled resources
        bundled = skill_data['bundled_resources']
        resource_count = sum(len(files) for files in bundled.values())
        if resource_count > 0:
            print(f"   Resources: {resource_count} files")
            for resource_type, files in bundled.items():
                if files:
                    print(f"     - {resource_type}: {len(files)} files")
        
        db.close()
        
    except SkillImportError as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


def import_all_command(args):
    """Import all available skills"""
    try:
        print("Fetching list of available skills...")
        skills = list_available_skills(args.github_token)
        
        print(f"Found {len(skills)} skills. Starting import...\n")
        
        success_count = 0
        error_count = 0
        skipped_count = 0
        
        for i, skill in enumerate(skills, 1):
            skill_name = skill['name']
            print(f"[{i}/{len(skills)}] Importing {skill_name}...", end=" ")
            
            try:
                # Fetch skill
                skill_data = fetch_skill(skill_name, args.github_token)
                item_data = skill_to_knowledge_item(skill_data, args.project_id)
                
                # Connect to database
                db = Database()
                db.initialize()
                repo = KnowledgeRepository(db)
                
                # Check if exists
                all_items = repo.get_all()
                existing = [item for item in all_items if item.item_type.value == 'skill' and skill_data['name'] in item.title]
                
                if existing and not args.force:
                    print("⏭️  (already exists)")
                    skipped_count += 1
                    db.close()
                    continue
                
                # Import
                from brian.models.knowledge_item import KnowledgeItem, ItemType
                
                skill_item = KnowledgeItem(
                    title=item_data['title'],
                    content=item_data['content'],
                    item_type=ItemType.SKILL,
                    url=item_data['url'],
                    skill_metadata=item_data['skill_metadata'],
                    project_id=item_data.get('project_id'),
                    tags=item_data.get('tags', []),
                )
                
                repo.create(skill_item)
                db.close()
                
                print("✅")
                success_count += 1
                
            except Exception as e:
                print(f"❌ ({str(e)[:50]})")
                error_count += 1
        
        print(f"\n📊 Import Summary:")
        print(f"   ✅ Imported: {success_count}")
        print(f"   ⏭️  Skipped: {skipped_count}")
        print(f"   ❌ Errors: {error_count}")
        
    except SkillImportError as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Import skills from Anthropic's skills repository"
    )
    parser.add_argument(
        '--github-token',
        help='GitHub personal access token (for higher rate limits)',
        default=None
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List available skills')
    list_parser.set_defaults(func=list_skills_command)
    
    # Fetch command
    fetch_parser = subparsers.add_parser('fetch', help='Fetch and display skill details')
    fetch_parser.add_argument('skill_name', help='Name of the skill to fetch')
    fetch_parser.add_argument('--full', action='store_true', help='Show full content')
    fetch_parser.set_defaults(func=fetch_skill_command)
    
    # Import command
    import_parser = subparsers.add_parser('import', help='Import a skill into Brian')
    import_parser.add_argument('skill_name', help='Name of the skill to import')
    import_parser.add_argument('--project-id', help='Project ID to import into')
    import_parser.add_argument('--force', action='store_true', help='Overwrite if exists')
    import_parser.set_defaults(func=import_skill_command)
    
    # Import all command
    import_all_parser = subparsers.add_parser('import-all', help='Import all skills')
    import_all_parser.add_argument('--project-id', help='Project ID to import into')
    import_all_parser.add_argument('--force', action='store_true', help='Overwrite existing')
    import_all_parser.set_defaults(func=import_all_command)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    args.func(args)


if __name__ == '__main__':
    main()
