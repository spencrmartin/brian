"""
Database migrations for brian
"""
import uuid

# Default project ID for migration - consistent UUID for existing data
DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000001"

MIGRATIONS = {
    2: [
        # Add link preview fields to knowledge_items
        "ALTER TABLE knowledge_items ADD COLUMN link_title TEXT",
        "ALTER TABLE knowledge_items ADD COLUMN link_description TEXT",
        "ALTER TABLE knowledge_items ADD COLUMN link_image TEXT",
        "ALTER TABLE knowledge_items ADD COLUMN link_site_name TEXT",
    ],
    3: [
        # Add pinboard position fields to knowledge_items
        "ALTER TABLE knowledge_items ADD COLUMN pinboard_x REAL",
        "ALTER TABLE knowledge_items ADD COLUMN pinboard_y REAL",
    ],
    4: [
        # Add knowledge regions for spatial grouping in graph view
        """CREATE TABLE IF NOT EXISTS regions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT DEFAULT '#8b5cf6',
            region_type TEXT NOT NULL DEFAULT 'manual',
            bounds_json TEXT,
            is_visible BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""",
        """CREATE TABLE IF NOT EXISTS region_items (
            region_id TEXT NOT NULL,
            item_id TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (region_id, item_id),
            FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE
        )""",
        "CREATE INDEX IF NOT EXISTS idx_regions_type ON regions(region_type)",
        "CREATE INDEX IF NOT EXISTS idx_regions_visible ON regions(is_visible)",
        "CREATE INDEX IF NOT EXISTS idx_region_items_region ON region_items(region_id)",
        "CREATE INDEX IF NOT EXISTS idx_region_items_item ON region_items(item_id)",
        """CREATE TRIGGER IF NOT EXISTS update_regions_timestamp 
           AFTER UPDATE ON regions
           BEGIN
               UPDATE regions SET updated_at = CURRENT_TIMESTAMP
               WHERE id = NEW.id;
           END""",
    ],
    5: [
        # Add region profiles for AI behavior configuration
        """CREATE TABLE IF NOT EXISTS region_profiles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            model_provider TEXT,
            model_name TEXT,
            temperature REAL DEFAULT 0.7,
            system_prompt TEXT,
            context_strategy TEXT DEFAULT 'dense_retrieval',
            max_context_items INTEGER DEFAULT 20,
            tools_config TEXT,
            recipe_path TEXT,
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""",
        # Add profile_id to regions table
        "ALTER TABLE regions ADD COLUMN profile_id TEXT REFERENCES region_profiles(id) ON DELETE SET NULL",
        # Indexes for region_profiles
        "CREATE INDEX IF NOT EXISTS idx_profiles_default ON region_profiles(is_default)",
        "CREATE INDEX IF NOT EXISTS idx_profiles_name ON region_profiles(name)",
        "CREATE INDEX IF NOT EXISTS idx_regions_profile ON regions(profile_id)",
        # Trigger for region_profiles updated_at
        """CREATE TRIGGER IF NOT EXISTS update_region_profiles_timestamp 
           AFTER UPDATE ON region_profiles
           BEGIN
               UPDATE region_profiles SET updated_at = CURRENT_TIMESTAMP
               WHERE id = NEW.id;
           END""",
    ],
    6: [
        # Add projects table for multi-project knowledge bases
        """CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT DEFAULT '#8b5cf6',
            icon TEXT,
            is_default BOOLEAN DEFAULT FALSE,
            is_archived BOOLEAN DEFAULT FALSE,
            last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""",
        # Add project_id to knowledge_items
        "ALTER TABLE knowledge_items ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL",
        # Add project_id to regions
        "ALTER TABLE regions ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL",
        # Add project_id to region_profiles
        "ALTER TABLE region_profiles ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL",
        # Indexes for project_id columns
        "CREATE INDEX IF NOT EXISTS idx_items_project ON knowledge_items(project_id)",
        "CREATE INDEX IF NOT EXISTS idx_regions_project ON regions(project_id)",
        "CREATE INDEX IF NOT EXISTS idx_profiles_project ON region_profiles(project_id)",
        "CREATE INDEX IF NOT EXISTS idx_projects_default ON projects(is_default)",
        "CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(is_archived)",
        "CREATE INDEX IF NOT EXISTS idx_projects_accessed ON projects(last_accessed_at DESC)",
        # Trigger for projects updated_at
        """CREATE TRIGGER IF NOT EXISTS update_projects_timestamp 
           AFTER UPDATE ON projects
           BEGIN
               UPDATE projects SET updated_at = CURRENT_TIMESTAMP
               WHERE id = NEW.id;
           END""",
    ],
    7: [
        # Add skill_metadata column for Anthropic skills integration
        "ALTER TABLE knowledge_items ADD COLUMN skill_metadata TEXT",
    ]
}

def apply_migrations(conn, current_version: int, target_version: int):
    """Apply all migrations between current and target version"""
    cursor = conn.cursor()
    
    for version in range(current_version + 1, target_version + 1):
        if version in MIGRATIONS:
            print(f"Applying migration to version {version}...")
            for sql in MIGRATIONS[version]:
                try:
                    cursor.execute(sql)
                except Exception as e:
                    # Column might already exist, that's ok
                    if "duplicate column" not in str(e).lower():
                        raise
            
            # Special handling for version 6: Create default project and migrate existing data
            if version == 6:
                _migrate_to_default_project(cursor)
            
            # Update schema version
            cursor.execute(
                "INSERT OR REPLACE INTO schema_version (version) VALUES (?)",
                (version,)
            )
            conn.commit()
            print(f"✓ Migration to version {version} complete")


def _migrate_to_default_project(cursor):
    """
    Create a default project and assign all existing items, regions, and profiles to it.
    This ensures backward compatibility when upgrading to multi-project support.
    """
    print("  Creating default project and migrating existing data...")
    
    # Check if default project already exists
    cursor.execute("SELECT id FROM projects WHERE id = ?", (DEFAULT_PROJECT_ID,))
    if cursor.fetchone():
        print("  Default project already exists, skipping creation")
        return
    
    # Create the default project
    cursor.execute("""
        INSERT INTO projects (id, name, description, color, icon, is_default, is_archived)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        DEFAULT_PROJECT_ID,
        "General",
        "General knowledge base",
        "#8b5cf6",
        "globe",  # Lucide icon name
        True,  # is_default
        False  # is_archived
    ))
    
    # Count items to migrate
    cursor.execute("SELECT COUNT(*) FROM knowledge_items WHERE project_id IS NULL")
    item_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM regions WHERE project_id IS NULL")
    region_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM region_profiles WHERE project_id IS NULL")
    profile_count = cursor.fetchone()[0]
    
    # Assign all existing items to the default project
    cursor.execute("""
        UPDATE knowledge_items SET project_id = ? WHERE project_id IS NULL
    """, (DEFAULT_PROJECT_ID,))
    
    # Assign all existing regions to the default project
    cursor.execute("""
        UPDATE regions SET project_id = ? WHERE project_id IS NULL
    """, (DEFAULT_PROJECT_ID,))
    
    # Assign all existing profiles to the default project
    cursor.execute("""
        UPDATE region_profiles SET project_id = ? WHERE project_id IS NULL
    """, (DEFAULT_PROJECT_ID,))
    
    print(f"  ✓ Migrated {item_count} items, {region_count} regions, {profile_count} profiles to default project")
