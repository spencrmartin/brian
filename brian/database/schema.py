"""
Database schema for brian - inspired by Goose's SQLite architecture
"""

SCHEMA_VERSION = 3

# Schema creation SQL statements
SCHEMA_SQL = """
-- Schema version tracking (inspired by Goose)
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main knowledge items table
CREATE TABLE IF NOT EXISTS knowledge_items (
    id TEXT PRIMARY KEY,  -- UUID
    title TEXT NOT NULL,
    content TEXT NOT NULL,  -- Markdown content
    item_type TEXT NOT NULL,  -- 'link', 'note', 'snippet', 'paper'
    url TEXT,  -- For links and papers
    language TEXT,  -- For code snippets
    favorite BOOLEAN DEFAULT FALSE,
    vote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- For time machine
    link_title TEXT,  -- Rich preview: title from og:title or <title>
    link_description TEXT,  -- Rich preview: description from og:description
    link_image TEXT,  -- Rich preview: image URL from og:image
    link_site_name TEXT,  -- Rich preview: site name from og:site_name
    pinboard_x REAL,  -- X position on pinboard canvas
    pinboard_y REAL  -- Y position on pinboard canvas
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT,  -- Hex color for visualization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS item_tags (
    item_id TEXT NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id, tag_id),
    FOREIGN KEY (item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Knowledge graph connections
CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_item_id TEXT NOT NULL,
    target_item_id TEXT NOT NULL,
    connection_type TEXT,  -- 'related', 'references', 'inspired_by', etc.
    strength REAL DEFAULT 1.0,  -- For graph visualization weight
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    FOREIGN KEY (target_item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    UNIQUE(source_item_id, target_item_id)
);

-- Link metadata (for preview cards)
CREATE TABLE IF NOT EXISTS link_metadata (
    item_id TEXT PRIMARY KEY,
    domain TEXT,
    preview_image TEXT,
    description TEXT,
    author TEXT,
    published_date TEXT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES knowledge_items(id) ON DELETE CASCADE
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_search USING fts5(
    item_id UNINDEXED,
    title,
    content,
    tags,
    content='knowledge_items',
    content_rowid='rowid'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_type ON knowledge_items(item_type);
CREATE INDEX IF NOT EXISTS idx_items_created ON knowledge_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_updated ON knowledge_items(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_favorite ON knowledge_items(favorite);
CREATE INDEX IF NOT EXISTS idx_items_votes ON knowledge_items(vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_connections_source ON connections(source_item_id);
CREATE INDEX IF NOT EXISTS idx_connections_target ON connections(target_item_id);

-- Triggers for updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_knowledge_items_timestamp 
AFTER UPDATE ON knowledge_items
BEGIN
    UPDATE knowledge_items SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- Trigger to sync FTS index
CREATE TRIGGER IF NOT EXISTS knowledge_items_ai AFTER INSERT ON knowledge_items BEGIN
    INSERT INTO knowledge_search(item_id, title, content)
    VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS knowledge_items_ad AFTER DELETE ON knowledge_items BEGIN
    DELETE FROM knowledge_search WHERE item_id = old.id;
END;

CREATE TRIGGER IF NOT EXISTS knowledge_items_au AFTER UPDATE ON knowledge_items BEGIN
    UPDATE knowledge_search SET title = new.title, content = new.content
    WHERE item_id = new.id;
END;
"""

def get_schema_version_sql():
    """Get SQL to insert current schema version"""
    return f"INSERT OR REPLACE INTO schema_version (version) VALUES ({SCHEMA_VERSION});"
