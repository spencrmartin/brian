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
