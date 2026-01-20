import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Tag, Info, Link as LinkIcon, FileText, Code2, FileCode } from 'lucide-react'

/**
 * SimilarityGraph - Force-directed graph showing content similarity connections
 * Uses D3.js force simulation to visualize relationships between knowledge items
 * Supports theme-based highlighting via hover
 */
export function SimilarityGraph({ items, width = 1200, height = 800 }) {
  const svgRef = useRef(null)
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredTheme, setHoveredTheme] = useState(null)
  const [showThemeLegend, setShowThemeLegend] = useState(false)
  const [showInfoLegend, setShowInfoLegend] = useState(false)

  // Store D3 element references for theme highlighting
  const linkElementsRef = useRef(null)
  const nodeElementsRef = useRef(null)
  const animationRef = useRef(null) // Store animation reference to stop it

  // Extract all unique themes (tags) from items
  const allThemes = useMemo(() => {
    const themeSet = new Set()
    items?.forEach(item => {
      item.tags?.forEach(tag => themeSet.add(tag))
    })
    return Array.from(themeSet).sort()
  }, [items])

  // Generate consistent colors for themes (same as Timeline)
  const getThemeColor = (theme) => {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#f97316', // orange
    ]
    
    let hash = 0
    for (let i = 0; i < theme.length; i++) {
      hash = theme.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Handle theme hover - add colored drop shadow to themed elements
  const handleThemeHover = (theme) => {
    setHoveredTheme(theme)
    
    if (!linkElementsRef.current || !nodeElementsRef.current || !theme) return

    const themeColor = getThemeColor(theme)
    
    // Add drop shadow to nodes that have this theme
    nodeElementsRef.current
      .style('filter', d => 
        d.tags?.includes(theme) 
          ? `drop-shadow(0 0 8px ${themeColor}) drop-shadow(0 0 4px ${themeColor})`
          : null
      )
    
    // Add colored glow to connections between nodes with this theme
    linkElementsRef.current
      .style('filter', l => {
        const sourceHasTheme = l.source.tags?.includes(theme)
        const targetHasTheme = l.target.tags?.includes(theme)
        return (sourceHasTheme && targetHasTheme)
          ? `drop-shadow(0 0 4px ${themeColor}) drop-shadow(0 0 2px ${themeColor})`
          : null
      })
      .attr('stroke', l => {
        const sourceHasTheme = l.source.tags?.includes(theme)
        const targetHasTheme = l.target.tags?.includes(theme)
        return (sourceHasTheme && targetHasTheme) ? themeColor : '#999'
      })
  }

  // Reset highlighting when hover ends
  const handleThemeHoverEnd = () => {
    setHoveredTheme(null)
    
    if (!linkElementsRef.current || !nodeElementsRef.current) return
    
    // Remove drop shadows
    nodeElementsRef.current.style('filter', null)
    
    // Reset links
    linkElementsRef.current
      .style('filter', null)
      .attr('stroke', '#999')
  }

  // Fetch similarity connections from API
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8080/api/v1/similarity/connections?threshold=0.15&max_per_item=5')
        const data = await response.json()
        setConnections(data)
      } catch (error) {
        console.error('Failed to fetch similarity connections:', error)
        setConnections([])
      } finally {
        setLoading(false)
      }
    }

    if (items && items.length > 0) {
      fetchConnections()
    }
  }, [items])

  // Handle pulsing animation for selected node (separate from main graph render)
  useEffect(() => {
    // Stop any existing animation by interrupting all transitions on the stored element
    if (animationRef.current) {
      d3.select(animationRef.current).interrupt()
      d3.select(animationRef.current).style('filter', null)
      animationRef.current = null
    }

    // Clear all node filters first
    if (nodeElementsRef.current) {
      nodeElementsRef.current.style('filter', null)
    }

    if (!selectedNode || !selectedNode.element) return

    // Store the element reference for cleanup
    animationRef.current = selectedNode.element

    // Start pulsing animation on the selected node
    const nodeElement = d3.select(selectedNode.element)
    
    // Set initial drop shadow
    nodeElement.style('filter', 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))')

    // Create pulsing animation
    function pulse() {
      nodeElement
        .transition()
        .duration(1000)
        .ease(d3.easeSinInOut)
        .style('filter', 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))')
        .transition()
        .duration(1000)
        .ease(d3.easeSinInOut)
        .style('filter', 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))')
        .on('end', pulse) // Loop the animation
    }

    pulse()

    // Cleanup function
    return () => {
      if (animationRef.current) {
        d3.select(animationRef.current).interrupt()
        d3.select(animationRef.current).style('filter', null)
        animationRef.current = null
      }
    }
  }, [selectedNode])

  useEffect(() => {
    if (!items || items.length === 0 || !svgRef.current || loading) return
    if (connections.length === 0) return

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Create nodes from items
    const nodes = items.map(item => ({
      id: item.id,
      title: item.title,
      type: item.item_type,
      tags: item.tags || [],
      ...item
    }))

    // Create links from connections
    const links = connections.map(conn => ({
      source: conn.source_item_id,
      target: conn.target_item_id,
      similarity: conn.similarity
    }))

    // Filter out links where nodes don't exist
    const nodeIds = new Set(nodes.map(n => n.id))
    const validLinks = links.filter(l => 
      nodeIds.has(l.source) && nodeIds.has(l.target)
    )

    // Color scale for node types
    const colorScale = d3.scaleOrdinal()
      .domain(['link', 'note', 'snippet', 'paper'])
      .range(['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'])

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;')

    // Add zoom behavior
    const g = svg.append('g')
    
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    
    svg.call(zoom)

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(validLinks)
        .id(d => d.id)
        .distance(d => 150 / (d.similarity + 0.1)) // Closer for higher similarity
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Add links
    const link = g.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(validLinks)
      .join('line')
      .attr('stroke-width', d => Math.max(1, d.similarity * 3))
      .attr('stroke-opacity', d => 0.3 + d.similarity * 0.5)

    // Store link reference for theme highlighting
    linkElementsRef.current = link

    // Add link labels for high similarity
    const linkLabel = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(validLinks.filter(d => d.similarity > 0.3))
      .join('text')
      .attr('font-size', 10)
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .text(d => `${(d.similarity * 100).toFixed(0)}%`)

    // Add nodes
    const node = g.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 8)
      .attr('fill', d => colorScale(d.type))
      .style('cursor', 'pointer')
      .call(drag(simulation))

    // Store node reference for theme highlighting
    nodeElementsRef.current = node

    // Add node labels
    const label = g.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('font-size', 11)
      .attr('font-weight', 'light')
      .attr('dx', 12)
      .attr('dy', 4)
      .text(d => d.title.length > 30 ? d.title.substring(0, 30) + '...' : d.title)
      .style('pointer-events', 'none')

    // Add hover effects for nodes
    node
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 12)
          .attr('stroke-width', 3)
        
        // Highlight connected links
        link
          .attr('stroke', l => 
            l.source.id === d.id || l.target.id === d.id ? '#3b82f6' : '#999'
          )
          .attr('stroke-width', l => 
            l.source.id === d.id || l.target.id === d.id 
              ? Math.max(2, l.similarity * 5) 
              : Math.max(1, l.similarity * 3)
          )
      })
      .on('mouseout', function(event, d) {
        // Don't reset if we're hovering a theme
        if (hoveredTheme) return
        
        d3.select(this)
          .attr('r', 8)
          .attr('stroke-width', 1.5)
        
        // Reset links
        link
          .attr('stroke', '#999')
          .attr('stroke-width', d => Math.max(1, d.similarity * 3))
      })
      .on('click', function(event, d) {
        // Store the node's screen position and element reference
        const nodeWithPosition = {
          ...d,
          screenX: event.pageX,
          screenY: event.pageY,
          element: this // Store DOM element reference
        }
        setSelectedNode(nodeWithPosition)
      })

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      linkLabel
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    })

    // Drag behavior
    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      }

      function dragged(event) {
        event.subject.fx = event.x
        event.subject.fy = event.y
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      }

      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    }

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [items, connections, width, height, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Computing similarities...</span>
      </div>
    )
  }

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-lg text-muted-foreground mb-2">No similar connections found</p>
        <p className="text-sm text-muted-foreground">
          Try adding more items or lowering the similarity threshold
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full"></svg>
      
      {/* Theme Legend Button - Circular like nav items */}
      {allThemes.length > 0 && (
        <div className="absolute top-6 right-6 z-40">
          <div className="group relative">
            <Button
              size="icon"
              onClick={() => setShowThemeLegend(!showThemeLegend)}
              className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
                showThemeLegend
                  ? 'bg-black hover:bg-gray-800 text-white'
                  : 'bg-white hover:bg-gray-100 text-black'
              }`}
            >
              <Tag className="w-5 h-5" />
            </Button>
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
              Themes
              {allThemes.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white text-black rounded text-xs">
                  {allThemes.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theme Legend Panel */}
      {showThemeLegend && allThemes.length > 0 && (
        <div className="absolute top-20 right-6 bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-xl border border-gray-200 max-w-sm max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Theme Connections</h3>
            <button
              onClick={() => setShowThemeLegend(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            Hover over themes to highlight connections
          </p>
          
          <div className="flex flex-wrap gap-2">
            {allThemes.map((theme) => {
              const themeColor = getThemeColor(theme)
              const isHovered = hoveredTheme === theme
              
              return (
                <button
                  key={theme}
                  onMouseEnter={() => handleThemeHover(theme)}
                  onMouseLeave={handleThemeHoverEnd}
                  className={`
                    px-3 py-1.5 rounded-md text-xs font-medium transition-all
                    ${isHovered ? 'scale-110 shadow-lg' : 'hover:scale-105'}
                  `}
                  style={{
                    backgroundColor: isHovered ? themeColor : `${themeColor}20`,
                    color: isHovered ? 'white' : themeColor,
                    borderColor: themeColor,
                    borderWidth: '1px'
                  }}
                >
                  {theme}
                </button>
              )
            })}
          </div>
          
          {hoveredTheme && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs font-medium" style={{ color: getThemeColor(hoveredTheme) }}>
                Showing: {hoveredTheme}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connections between items with this theme are highlighted
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Info/Legend Button - Circular like nav items */}
      <div className="absolute bottom-6 right-6 z-40">
        <div className="group relative">
          <Button
            size="icon"
            onClick={() => setShowInfoLegend(!showInfoLegend)}
            className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
              showInfoLegend
                ? 'bg-black hover:bg-gray-800 text-white'
                : 'bg-white hover:bg-gray-100 text-black'
            }`}
          >
            <Info className="w-5 h-5" />
          </Button>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
            Graph Info
          </div>
        </div>
      </div>

      {/* Info/Legend Panel */}
      {showInfoLegend && (
        <div className="absolute bottom-20 right-6 bg-white/95 backdrop-blur-md p-4 rounded-lg shadow-xl border border-gray-200 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Graph Legend</h3>
            <button
              onClick={() => setShowInfoLegend(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-semibold mb-2">Item Types</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs">Links</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs">Snippets</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span className="text-xs">Papers</span>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <h4 className="text-xs font-semibold mb-2">Statistics</h4>
              <p className="text-xs text-muted-foreground">
                {connections.length} connections found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {items.length} items in graph
              </p>
            </div>
            
            <div className="pt-3 border-t">
              <h4 className="text-xs font-semibold mb-2">Controls</h4>
              <p className="text-xs text-muted-foreground">
                • Line thickness = similarity strength
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                • Drag nodes to reposition
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                • Scroll to zoom in/out
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                • Click nodes for details
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Blade - Selected node */}
      {selectedNode && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 animate-in fade-in duration-200"
            onClick={() => setSelectedNode(null)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[400px] z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white rounded-t-2xl shadow-lg border-t border-x border-gray-200 max-h-[80vh] overflow-y-auto">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>
              
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {selectedNode.item_type === 'link' && <LinkIcon className="w-5 h-5" />}
                  {selectedNode.item_type === 'note' && <FileText className="w-5 h-5" />}
                  {selectedNode.item_type === 'code' && <Code2 className="w-5 h-5" />}
                  {selectedNode.item_type === 'paper' && <FileCode className="w-5 h-5" />}
                  <span className="text-sm text-muted-foreground capitalize font-medium">{selectedNode.item_type}</span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>
              
              {/* Card Content */}
              <div className="px-6 py-6">
                <h3 className="font-semibold text-xl mb-3 leading-snug">
                  {selectedNode.title}
                </h3>
                
                <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                  {selectedNode.content}
                </p>
                
                {selectedNode.url && (
                  <a
                    href={selectedNode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LinkIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{selectedNode.url}</span>
                  </a>
                )}
                
                {selectedNode.language && (
                  <div className="mb-4">
                    <Badge variant="outline" className="text-sm px-3 py-1">{selectedNode.language}</Badge>
                  </div>
                )}
                
                {selectedNode.tags && selectedNode.tags.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.tags.map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-sm px-3 py-1.5 cursor-pointer hover:scale-110 transition-transform"
                          style={{
                            backgroundColor: `${getThemeColor(tag)}20`,
                            borderColor: getThemeColor(tag),
                            color: getThemeColor(tag),
                            borderWidth: '1px'
                          }}
                          onMouseEnter={() => handleThemeHover(tag)}
                          onMouseLeave={handleThemeHoverEnd}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedNode.created_at && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(selectedNode.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
