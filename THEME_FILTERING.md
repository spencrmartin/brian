# Theme-Based Connection Highlighting

## Overview
The SimilarityGraph now supports **theme-based connection highlighting** using tags, inspired by the Timeline view's colored thematic lines. When you hover over a theme, the graph highlights all connections between items that share that theme, making it easy to see how topics cluster and relate.

## How It Works

### 1. **Theme Extraction**
- All unique tags from your knowledge items are extracted as "themes"
- Themes are sorted alphabetically for easy browsing
- Each theme gets a consistent color (same color system as Timeline)

### 2. **Hover-Based Highlighting**
When you hover over a theme:
- **Nodes** with that theme stay fully visible (opacity 1)
- **Nodes** without that theme fade out (opacity 0.2)
- **Connections** between nodes with that theme are colored with the theme color
- **Connections** not related to the theme fade to nearly invisible
- **Line thickness** increases for highlighted connections

### 3. **Visual Design**
- **Theme Button**: Top-left corner, shows theme count
- **Theme Pills**: Color-coded buttons matching Timeline colors
- **Hover Effect**: Pills scale up and become solid color
- **Active Indicator**: Shows which theme is currently highlighted
- **Tag Badges**: In node info panel, also trigger highlighting on hover

## Usage

### Opening the Theme Panel
1. Click the **"Themes"** button in the top-left corner of the graph
2. The theme panel opens showing all available themes as colored pills

### Highlighting Connections
1. **Hover over any theme pill** to highlight connections
2. The graph instantly updates:
   - Relevant nodes stay bright
   - Relevant connections turn the theme color
   - Everything else fades out
3. **Move your mouse away** to reset the view

### Theme Pills
- Each theme is a colored pill matching the Timeline color scheme
- Hover to highlight (no clicking needed!)
- The pill scales up and becomes solid when hovered
- An indicator shows which theme is active

### Node Info Panel Integration
- When you click a node, its info panel shows its tags
- **Hover over any tag badge** to highlight that theme's connections
- This lets you explore themes directly from node details

## Use Cases

### 1. **Topic Exploration**
Hover "goose" to see:
- All Goose-related documents highlighted
- How they connect to each other
- The strength of Goose-related connections

### 2. **Cross-Topic Analysis**
Hover different themes in sequence:
- "goose" → see Goose cluster
- "adaptive-ui" → see UI cluster
- "g2" → see g2 cluster
- Compare how different topics cluster

### 3. **Project Focus**
Hover project tags:
- "g2" to see all g2 documents and connections
- "commerce" for commerce-related items
- Understand project-specific knowledge networks

### 4. **Research Patterns**
Identify theme characteristics:
- Which themes have dense connections?
- Which themes bridge to other topics?
- Are certain themes isolated or well-connected?

### 5. **Quick Theme Switching**
- Hover between themes rapidly
- Compare connection patterns
- No need to click or reset - just move your mouse!

## Color Consistency

The same 8-color palette is used across Timeline and Graph:
1. **Blue** (#3b82f6)
2. **Green** (#10b981)
3. **Amber** (#f59e0b)
4. **Red** (#ef4444)
5. **Violet** (#8b5cf6)
6. **Pink** (#ec4899)
7. **Cyan** (#06b6d4)
8. **Orange** (#f97316)

Colors are assigned consistently using a hash function, so the same tag always gets the same color across both views.

## Technical Details

### State Management
```javascript
const [hoveredTheme, setHoveredTheme] = useState(null)
const linkElementsRef = useRef(null)
const nodeElementsRef = useRef(null)
```

### Highlighting Logic
```javascript
// On theme hover
nodeElementsRef.current
  .attr('opacity', d => d.tags?.includes(theme) ? 1 : 0.2)

linkElementsRef.current
  .attr('stroke', l => {
    const sourceHasTheme = l.source.tags?.includes(theme)
    const targetHasTheme = l.target.tags?.includes(theme)
    return (sourceHasTheme && targetHasTheme) ? themeColor : '#999'
  })
```

### Performance
- Uses D3 element references for instant updates
- No re-rendering of React components
- Smooth transitions handled by D3
- Efficient hover detection

## Advantages Over Filtering

### Why Hover Instead of Click-to-Filter?
1. **Faster Exploration**: No clicking, just move your mouse
2. **Non-Destructive**: Graph layout stays stable
3. **Quick Comparison**: Rapidly switch between themes
4. **No Reset Needed**: Move away to see everything again
5. **Visual Clarity**: Fading is more intuitive than hiding

### Best of Both Worlds
- **Timeline**: Shows theme connections over time with colored lines
- **Graph**: Shows theme connections in network space with highlighting
- **Consistent Colors**: Same theme = same color in both views

## Tips

### Best Practices
1. **Open Theme Panel**: Keep it open while exploring
2. **Hover Slowly**: Give yourself time to see the patterns
3. **Compare Themes**: Hover different themes to compare clusters
4. **Use Node Tags**: Hover tags in node info for quick theme checks
5. **Combine with Zoom**: Zoom in on highlighted clusters for detail

### Tagging Strategy
For effective theme highlighting:
- Use **consistent tag names** (e.g., "goose" not "Goose" or "goose-project")
- Apply **multiple tags** to items (e.g., "goose", "adaptive-ui", "design")
- Use **hierarchical tags** (e.g., "g2", "g2-process-server", "g2-sharing")
- Keep tags **concise** (2-3 words max)

## Troubleshooting

### "No themes available"
- Your items don't have tags yet
- Add tags to items via the edit dialog

### Highlighting doesn't work
- Make sure you're hovering, not clicking
- Check that items actually have the theme you're hovering
- Refresh the page if the graph seems stuck

### Colors don't match Timeline
- They should! Both use the same color hash function
- If they don't, it might be a caching issue - refresh

### Highlighting is too subtle
- Connections fade to 0.1 opacity (nearly invisible)
- Highlighted connections go to 0.8 opacity (bright)
- This creates strong contrast

## Example Workflow

1. **Open Graph**: Navigate to the Graph view
2. **Click Themes**: Open the theme panel (top-left)
3. **Hover "goose"**: See all Goose-related connections light up in blue
4. **Move to "g2"**: See g2 connections highlight
5. **Notice Overlap**: Some nodes might have both themes
6. **Click a Node**: See its tags in the info panel
7. **Hover a Tag**: Highlight that theme's connections
8. **Close Panel**: Theme highlighting still works from node tags!

## Future Enhancements

### Possible Additions
1. **Multi-Theme Hover**: Hold Shift to highlight multiple themes
2. **Theme Statistics**: Show connection count when hovering
3. **Theme Clustering**: Group related themes visually
4. **Persistent Highlight**: Click to lock a theme highlight
5. **Theme Search**: Quick search for themes in large collections
6. **Export Highlighted**: Export just the highlighted subgraph

### Integration Ideas
1. **Timeline Sync**: Hover theme in Timeline, highlight in Graph
2. **Theme Recommendations**: "Items with this theme also have..."
3. **Theme Evolution**: Show how theme connections change over time
4. **Collaborative Themes**: See themes used by team members

---

**Status**: ✅ Implemented and ready to use!
**Type**: Hover-based highlighting (non-destructive)
**Related**: See `GRAPH_VISUALIZATION_EXPLAINED.md` for general graph usage
