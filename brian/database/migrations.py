"""
Database migrations for brian
"""

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
            
            # Update schema version
            cursor.execute(
                "INSERT OR REPLACE INTO schema_version (version) VALUES (?)",
                (version,)
            )
            conn.commit()
            print(f"✓ Migration to version {version} complete")
