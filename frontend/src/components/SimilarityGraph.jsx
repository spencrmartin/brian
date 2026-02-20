import { getApiBaseUrl } from "@/lib/backend"
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// TODO: Add Slider component for zoom control in Phase 6d
// import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Tag, Info, Link as LinkIcon, FileText, Code2, FileCode, Map as MapIcon, Eye, EyeOff, Pencil, Trash2, Plus, Check, Settings2, Brain, Sparkles, Home, Layers, ZoomIn, ZoomOut } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { RegionEditDialog } from './RegionEditDialog'
import { ProjectPill } from './ProjectPill'
import { ItemDetailSheet } from './ItemDetailSheet'

// Distance multiplier for spreading projects apart
const PROJECT_SPREAD = 2000

// Predefined color palette for regions
const REGION_COLORS = [
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#22c55e', // green
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#a855f7', // purple
]

/**
 * Compute convex hull for a set of points
 * Uses Graham scan algorithm
 */
function computeConvexHull(points) {
  if (points.length < 3) return points
  
  // Find the point with lowest y (and leftmost if tie)
  let start = 0
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < points[start].y || 
        (points[i].y === points[start].y && points[i].x < points[start].x)) {
      start = i
    }
  }
  
  // Swap start point to beginning
  [points[0], points[start]] = [points[start], points[0]]
  const pivot = points[0]
  
  // Sort by polar angle
  const sorted = points.slice(1).sort((a, b) => {
    const angleA = Math.atan2(a.y - pivot.y, a.x - pivot.x)
    const angleB = Math.atan2(b.y - pivot.y, b.x - pivot.x)
    return angleA - angleB
  })
  
  // Build hull
  const hull = [pivot]
  for (const point of sorted) {
    while (hull.length > 1) {
      const top = hull[hull.length - 1]
      const second = hull[hull.length - 2]
      const cross = (top.x - second.x) * (point.y - second.y) - 
                    (top.y - second.y) * (point.x - second.x)
      if (cross <= 0) hull.pop()
      else break
    }
    hull.push(point)
  }
  
  return hull
}

/**
 * Expand hull points outward by a padding amount
 */
function expandHull(hull, padding = 30) {
  if (hull.length < 3) return hull
  
  // Calculate centroid
  const cx = hull.reduce((sum, p) => sum + p.x, 0) / hull.length
  const cy = hull.reduce((sum, p) => sum + p.y, 0) / hull.length
  
  // Expand each point outward from centroid
  return hull.map(p => {
    const dx = p.x - cx
    const dy = p.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return p
    return {
      x: p.x + (dx / dist) * padding,
      y: p.y + (dy / dist) * padding
    }
  })
}

/**
 * Generate smooth path for hull using cardinal spline
 */
function hullPath(hull) {
  if (hull.length < 3) return ''
  
  const line = d3.line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveCardinalClosed.tension(0.7))
  
  return line(hull)
}

/**
 * Update region hulls on the SVG layer
 */
function updateRegionHulls(regionsLayer, regions, nodePositions, hoveredRegionId) {
  if (!regionsLayer || !regions) return
  
  // Filter to visible regions only
  const visibleRegions = regions.filter(r => r.is_visible)
  
  // Bind data to region groups
  const regionGroups = regionsLayer.selectAll('.region-group')
    .data(visibleRegions, d => d.id)
  
  // Remove old regions
  regionGroups.exit().remove()
  
  // Add new region groups
  const enterGroups = regionGroups.enter()
    .append('g')
    .attr('class', 'region-group')
  
  // Add path for hull shape
  enterGroups.append('path')
    .attr('class', 'region-hull')
    .attr('fill-opacity', 0.15)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '8,4')
  
  // Add label at centroid
  enterGroups.append('text')
    .attr('class', 'region-label')
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('font-weight', 500)
    .attr('fill-opacity', 0.8)
    .attr('pointer-events', 'none')
  
  // Merge enter and update selections
  const allGroups = enterGroups.merge(regionGroups)
  
  // Update each region
  allGroups.each(function(region) {
    const group = d3.select(this)
    const isHovered = region.id === hoveredRegionId
    
    // Get positions of items in this region
    const points = (region.item_ids || [])
      .map(id => nodePositions.get(id))
      .filter(p => p && p.x !== undefined && p.y !== undefined)
    
    if (points.length < 2) {
      // Not enough points to draw a region
      group.select('.region-hull').attr('d', '')
      group.select('.region-label').attr('opacity', 0)
      return
    }
    
    // For 2 points, create an ellipse-like shape
    let hull, expandedHull
    if (points.length === 2) {
      // Create a pill shape between two points
      const [p1, p2] = points
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const perpX = -dy / dist * 40
      const perpY = dx / dist * 40
      
      hull = [
        { x: p1.x + perpX, y: p1.y + perpY },
        { x: p2.x + perpX, y: p2.y + perpY },
        { x: p2.x - perpX, y: p2.y - perpY },
        { x: p1.x - perpX, y: p1.y - perpY }
      ]
      expandedHull = hull
    } else {
      // Compute convex hull and expand it
      hull = computeConvexHull([...points])
      expandedHull = expandHull(hull, 40)
    }
    
    // Calculate centroid for label
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length
    
    // Update hull path
    group.select('.region-hull')
      .attr('d', hullPath(expandedHull))
      .attr('fill', region.color)
      .attr('stroke', region.color)
      .attr('fill-opacity', isHovered ? 0.25 : 0.12)
      .attr('stroke-opacity', isHovered ? 1 : 0.6)
      .attr('stroke-width', isHovered ? 3 : 2)
    
    // Update label
    group.select('.region-label')
      .attr('x', cx)
      .attr('y', cy - (points.length === 2 ? 0 : Math.max(...points.map(p => Math.abs(p.y - cy))) + 25))
      .attr('fill', region.color)
      .attr('opacity', isHovered ? 1 : 0.7)
      .text(region.name)
  })
}

/**
 * Update project hulls on the SVG layer
 * Similar to updateRegionHulls but for project-level groupings
 */
function updateProjectHulls(projectsLayer, projects, nodePositions, zoomScale, hoveredProjectId) {
  if (!projectsLayer || !projects || projects.length === 0) {
    console.log('[ProjectHulls] Early return:', { hasLayer: !!projectsLayer, projectCount: projects?.length || 0 })
    return
  }
  
  // Show project hulls at all zoom levels in universe mode (opacity based on zoom)
  // More visible when zoomed out, but always somewhat visible
  const projectHullOpacity = zoomScale < 0.6 ? Math.min(1, (0.6 - zoomScale) * 3 + 0.2) : 0.2
  
  console.log('[ProjectHulls] Updating:', { 
    projectCount: projects.length, 
    nodeCount: nodePositions.size, 
    zoomScale, 
    opacity: projectHullOpacity 
  })
  
  // Bind data to project groups
  const projectGroups = projectsLayer.selectAll('.project-group')
    .data(projects, d => d.id)
  
  // Remove old projects
  projectGroups.exit().remove()
  
  // Add new project groups
  const enterGroups = projectGroups.enter()
    .append('g')
    .attr('class', 'project-group')
  
  // Add path for hull shape
  enterGroups.append('path')
    .attr('class', 'project-hull')
    .attr('fill-opacity', 0.08)
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '12,6')
  
  // Add label at centroid
  enterGroups.append('text')
    .attr('class', 'project-label')
    .attr('text-anchor', 'middle')
    .attr('font-size', 24)
    .attr('font-weight', 600)
    .attr('fill-opacity', 0.9)
    .attr('pointer-events', 'none')
  
  // Add item count badge
  enterGroups.append('text')
    .attr('class', 'project-count')
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 400)
    .attr('fill-opacity', 0.6)
    .attr('pointer-events', 'none')
  
  // Merge enter and update selections
  const allGroups = enterGroups.merge(projectGroups)
  
  // Update each project
  allGroups.each(function(project) {
    const group = d3.select(this)
    const isHovered = project.id === hoveredProjectId
    
    // Get positions of items in this project
    const points = (project.itemIds || [])
      .map(id => nodePositions.get(id))
      .filter(p => p && p.x !== undefined && p.y !== undefined)
    
    if (points.length < 2) {
      group.select('.project-hull').attr('d', '').attr('opacity', 0)
      group.select('.project-label').attr('opacity', 0)
      group.select('.project-count').attr('opacity', 0)
      return
    }
    
    // Compute convex hull with larger padding for projects
    let hull, expandedHull
    if (points.length === 2) {
      const [p1, p2] = points
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const perpX = -dy / dist * 80
      const perpY = dx / dist * 80
      
      hull = [
        { x: p1.x + perpX, y: p1.y + perpY },
        { x: p2.x + perpX, y: p2.y + perpY },
        { x: p2.x - perpX, y: p2.y - perpY },
        { x: p1.x - perpX, y: p1.y - perpY }
      ]
      expandedHull = hull
    } else {
      hull = computeConvexHull([...points])
      expandedHull = expandHull(hull, 80) // Larger padding for projects
    }
    
    // Calculate centroid for label
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length
    
    // Update hull path with prominent outline
    group.select('.project-hull')
      .attr('d', hullPath(expandedHull))
      .attr('fill', project.color || '#6366f1')
      .attr('stroke', project.color || '#6366f1')
      .attr('fill-opacity', (isHovered ? 0.15 : 0.08) * projectHullOpacity)
      .attr('stroke-opacity', isHovered ? 1 : 0.7)
      .attr('stroke-width', isHovered ? 4 : 3)
      .attr('opacity', projectHullOpacity)
    
    // Update label - show project name when zoomed out
    group.select('.project-label')
      .attr('x', cx)
      .attr('y', cy - 15)
      .attr('fill', project.color || '#6366f1')
      .attr('opacity', projectHullOpacity * (isHovered ? 1 : 0.8))
      .text(project.name)
    
    // Update item count
    group.select('.project-count')
      .attr('x', cx)
      .attr('y', cy + 15)
      .attr('fill', project.color || '#6366f1')
      .attr('opacity', projectHullOpacity * 0.6)
      .text(`${points.length} items`)
  })
}

/**
 * SimilarityGraph - Force-directed graph showing content similarity connections
 * Uses D3.js force simulation to visualize relationships between knowledge items
 * Supports theme-based highlighting via hover and knowledge regions
 * 
 * HIERARCHICAL ZOOM: Shows all projects in a "knowledge universe" where
 * zooming out reveals project clusters as galaxies
 */
export function SimilarityGraph({ items, width = 1200, height = 800 }) {
  const svgRef = useRef(null)
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredTheme, setHoveredTheme] = useState(null)
  const [hoveredRegion, setHoveredRegion] = useState(null)
  const [hoveredProject, setHoveredProject] = useState(null)
  const [showThemeLegend, setShowThemeLegend] = useState(false)
  const [showInfoLegend, setShowInfoLegend] = useState(false)
  const [showRegionsPanel, setShowRegionsPanel] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Hierarchical zoom state
  const [zoomScale, setZoomScale] = useState(1)
  const [allProjects, setAllProjects] = useState([])
  const [allItems, setAllItems] = useState([])
  const [allRegions, setAllRegions] = useState([])
  const zoomRef = useRef(null)
  const svgSelectionRef = useRef(null)
  const projectElementsRef = useRef(null)
  
  // Region and project state from store
  const { 
    regions, 
    fetchRegions, 
    createRegion,
    updateRegion,
    toggleRegionVisibility,
    deleteRegion,
    regionsLoading,
    currentProject,
    projects,
    viewAllProjects,
    setViewAllProjects,
    items: storeItems,
    fetchItems
  } = useStore()
  
  // Universe mode is synced with viewAllProjects from store
  // This ensures ProjectSelector "All Projects" and graph Universe Mode are in sync
  const universeMode = viewAllProjects
  const setUniverseMode = (value) => setViewAllProjects(value)
  
  // Use store items (project-filtered) when not in universe mode
  // The items prop from App.jsx is NOT filtered by project, so we ignore it
  // and use the store's items which respect the currentProject filter
  const projectFilteredItems = storeItems
  
  // Create Region dialog state
  const [showCreateRegionDialog, setShowCreateRegionDialog] = useState(false)
  const [newRegionName, setNewRegionName] = useState('')
  const [newRegionDescription, setNewRegionDescription] = useState('')
  const [newRegionColor, setNewRegionColor] = useState(REGION_COLORS[0])
  const [selectedItemIds, setSelectedItemIds] = useState([])
  const [isCreatingRegion, setIsCreatingRegion] = useState(false)
  
  // Edit Region dialog state
  const [showEditRegionDialog, setShowEditRegionDialog] = useState(false)
  const [editingRegion, setEditingRegion] = useState(null)
  
  // Region profiles cache (to show profile names in popover)
  const [regionProfiles, setRegionProfiles] = useState({})
  
  // Store node positions for region hull calculation
  const nodePositionsRef = useRef(new Map())
  const regionElementsRef = useRef(null)
  const hoveredRegionRef = useRef(null)
  
  // Refs for semantic zoom element updates
  const labelElementsRef = useRef(null)
  const linkLabelElementsRef = useRef(null)

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    checkDarkMode()
    
    // Watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

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
  // In universe mode: fetch ALL connections across all projects
  // In normal mode: scope to current project
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true)
        
        // Build URL - no project filter in universe mode to get cross-project connections
        let url = getApiBaseUrl() + '/similarity/connections?threshold=0.15&max_per_item=5'
        if (!universeMode && currentProject?.id) {
          url += `&project_id=${currentProject.id}`
        }
        
        const response = await fetch(url)
        const data = await response.json()
        setConnections(data)
        
        // In universe mode, also fetch all items across all projects
        if (universeMode) {
          try {
            const itemsResponse = await fetch(getApiBaseUrl() + '/items')
            const allItemsData = await itemsResponse.json()
            setAllItems(allItemsData)
          } catch (err) {
            console.error('Failed to fetch all items:', err)
          }
        }
      } catch (error) {
        console.error('Failed to fetch similarity connections:', error)
        setConnections([])
      } finally {
        setLoading(false)
      }
    }

    // In universe mode, always fetch (we'll get all items from the API)
    // In normal mode, wait for items prop to be populated
    if (universeMode || (items && items.length > 0)) {
      fetchConnections()
    }
  }, [items, currentProject?.id, universeMode])
  
  // Compute project centroids for clustering forces
  const projectCentroids = useMemo(() => {
    if (!universeMode || !projects || projects.length === 0) return new Map()
    
    const centroids = new Map()
    const numProjects = projects.length
    const angleStep = (2 * Math.PI) / numProjects
    
    // Arrange projects in a circle around the center
    projects.forEach((project, index) => {
      const angle = index * angleStep - Math.PI / 2 // Start from top
      centroids.set(project.id, {
        x: width / 2 + Math.cos(angle) * PROJECT_SPREAD,
        y: height / 2 + Math.sin(angle) * PROJECT_SPREAD,
        color: project.color || '#6366f1',
        name: project.name
      })
    })
    
    return centroids
  }, [universeMode, projects, width, height])

  // Fetch regions when component mounts
  useEffect(() => {
    fetchRegions()
  }, [fetchRegions])

  // Fetch profile for a specific region
  const fetchProfileForRegion = useCallback(async (regionId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/regions/${regionId}/profile`)
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setRegionProfiles(prev => ({
            ...prev,
            [regionId]: data.profile
          }))
          return data.profile
        }
      }
      // If no profile, clear from cache
      setRegionProfiles(prev => {
        const updated = { ...prev }
        delete updated[regionId]
        return updated
      })
      return null
    } catch (error) {
      console.error(`Failed to fetch profile for region ${regionId}:`, error)
      return null
    }
  }, [])

  // Fetch profile details for regions that have profiles
  useEffect(() => {
    const fetchProfilesForRegions = async () => {
      const regionsWithProfiles = regions.filter(r => r.profile_id && !regionProfiles[r.id])
      
      for (const region of regionsWithProfiles) {
        await fetchProfileForRegion(region.id)
      }
    }
    
    if (regions.length > 0) {
      fetchProfilesForRegions()
    }
  }, [regions, fetchProfileForRegion])

  // Handle opening the create region dialog
  const handleOpenCreateRegion = useCallback(() => {
    // Reset form state
    setNewRegionName('')
    setNewRegionDescription('')
    setNewRegionColor(REGION_COLORS[Math.floor(Math.random() * REGION_COLORS.length)])
    setSelectedItemIds([])
    setShowCreateRegionDialog(true)
  }, [])

  // Handle creating a new region
  const handleCreateRegion = useCallback(async () => {
    if (!newRegionName.trim()) return
    
    setIsCreatingRegion(true)
    try {
      await createRegion({
        name: newRegionName.trim(),
        description: newRegionDescription.trim(),
        color: newRegionColor,
        item_ids: selectedItemIds
      })
      setShowCreateRegionDialog(false)
      // Reset form
      setNewRegionName('')
      setNewRegionDescription('')
      setSelectedItemIds([])
    } catch (error) {
      console.error('Failed to create region:', error)
    } finally {
      setIsCreatingRegion(false)
    }
  }, [newRegionName, newRegionDescription, newRegionColor, selectedItemIds, createRegion])

  // Toggle item selection for region
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

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

  // Fetch store items when component mounts or project changes
  useEffect(() => {
    if (!universeMode) {
      fetchItems()
    }
  }, [universeMode, currentProject?.id, fetchItems])
  
  // Initialize data on mount - ensure we fetch in Universe Mode on first load
  useEffect(() => {
    const initializeGraph = async () => {
      console.log('[SimilarityGraph] Initializing...', { universeMode, projectsCount: projects?.length })
      
      if (universeMode) {
        // In universe mode, fetch all items directly on mount
        try {
          setLoading(true)
          
          // Fetch connections
          const connectionsResponse = await fetch(getApiBaseUrl() + '/similarity/connections?threshold=0.15&max_per_item=5')
          const connectionsData = await connectionsResponse.json()
          setConnections(connectionsData)
          
          // Fetch all items
          const itemsResponse = await fetch(getApiBaseUrl() + '/items')
          const allItemsData = await itemsResponse.json()
          console.log('[SimilarityGraph] Fetched all items:', allItemsData.length)
          setAllItems(allItemsData)
        } catch (err) {
          console.error('[SimilarityGraph] Init failed:', err)
        } finally {
          setLoading(false)
        }
      }
    }
    
    initializeGraph()
  }, []) // Only run on mount

  useEffect(() => {
    // In universe mode, use allItems (all projects)
    // Otherwise use projectFilteredItems from store (filtered by current project)
    const displayItems = universeMode && allItems.length > 0 ? allItems : projectFilteredItems
    
    if (!displayItems || displayItems.length === 0 || !svgRef.current || loading) return
    if (connections.length === 0) return

    console.log('[SimilarityGraph] Rendering:', { 
      universeMode, 
      displayItemsCount: displayItems.length, 
      projectFilteredCount: projectFilteredItems?.length,
      allItemsCount: allItems.length,
      projectsCount: projects?.length,
      currentProjectId: currentProject?.id
    })

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    // Create nodes from items
    const nodes = displayItems.map(item => ({
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
      .domain(['link', 'note', 'snippet', 'paper', 'skill'])
      .range(['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']) // Added pink for skills

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;')

    // Add zoom behavior
    const g = svg.append('g')
    
    const zoom = d3.zoom()
      .scaleExtent([0.05, 4]) // Extended range for universe view (0.05 = very zoomed out)
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
      .force('collision', d3.forceCollide().radius(30))
    
    // In universe mode, add project clustering forces instead of center force
    if (universeMode && projectCentroids.size > 0) {
      // Pull nodes toward their project's centroid
      simulation
        .force('projectX', d3.forceX(d => {
          const centroid = projectCentroids.get(d.project_id)
          return centroid ? centroid.x : width / 2
        }).strength(0.3))
        .force('projectY', d3.forceY(d => {
          const centroid = projectCentroids.get(d.project_id)
          return centroid ? centroid.y : height / 2
        }).strength(0.3))
    } else {
      // Normal mode: center force
      simulation.force('center', d3.forceCenter(width / 2, height / 2))
    }

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

    // Theme-aware colors for text
    const textColor = isDarkMode ? '#e5e5e5' : '#333'
    const mutedTextColor = isDarkMode ? '#a3a3a3' : '#666'

    // Add link labels for high similarity
    const linkLabel = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(validLinks.filter(d => d.similarity > 0.3))
      .join('text')
      .attr('font-size', 10)
      .attr('fill', mutedTextColor)
      .attr('text-anchor', 'middle')
      .text(d => `${(d.similarity * 100).toFixed(0)}%`)
    
    // Store link label reference for semantic zoom
    linkLabelElementsRef.current = linkLabel

    // Add nodes with special handling for skills (cloud appearance)
    const nodeGroup = g.append('g')
      .attr('class', 'nodes')
    
    // Create node groups for each item
    const node = nodeGroup
      .selectAll('g.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(drag(simulation))
    
    // For regular nodes (not skills), add a single circle
    node.filter(d => d.type !== 'skill')
      .append('circle')
      .attr('r', 8)
      .attr('fill', d => colorScale(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
    
    // For skill nodes, create a cloud effect with multiple overlapping circles
    const skillNodes = node.filter(d => d.type === 'skill')
    
    // Add glow filter for skills
    const defs = svg.append('defs')
    const filter = defs.append('filter')
      .attr('id', 'skill-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%')
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur')
    
    const feMerge = filter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
    
    // Create cloud structure for each skill node
    skillNodes.each(function(d) {
      const skillGroup = d3.select(this)
      const skillColor = colorScale(d.type) // Pink
      
      // Add multiple circles to create cloud effect
      // Center circle (largest)
      skillGroup.append('circle')
        .attr('r', 12)
        .attr('fill', skillColor)
        .attr('fill-opacity', 0.3)
        .attr('stroke', skillColor)
        .attr('stroke-width', 2)
        .attr('filter', 'url(#skill-glow)')
      
      // Top-left bubble
      skillGroup.append('circle')
        .attr('cx', -6)
        .attr('cy', -6)
        .attr('r', 7)
        .attr('fill', skillColor)
        .attr('fill-opacity', 0.25)
        .attr('stroke', 'none')
      
      // Top-right bubble
      skillGroup.append('circle')
        .attr('cx', 6)
        .attr('cy', -6)
        .attr('r', 6)
        .attr('fill', skillColor)
        .attr('fill-opacity', 0.25)
        .attr('stroke', 'none')
      
      // Bottom bubble
      skillGroup.append('circle')
        .attr('cx', 0)
        .attr('cy', 8)
        .attr('r', 8)
        .attr('fill', skillColor)
        .attr('fill-opacity', 0.25)
        .attr('stroke', 'none')
    })

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
      .attr('fill', textColor)
      .attr('dx', 12)
      .attr('dy', 4)
      .text(d => d.title.length > 30 ? d.title.substring(0, 30) + '...' : d.title)
      .style('pointer-events', 'none')
    
    // Store label reference for semantic zoom
    labelElementsRef.current = label

    // Add hover effects for nodes
    node
      .on('mouseover', function(event, d) {
        const nodeGroup = d3.select(this)
        
        // For regular nodes, scale up the circle
        if (d.type !== 'skill') {
          nodeGroup.select('circle')
            .attr('r', 12)
            .attr('stroke-width', 3)
        } else {
          // For skill nodes, scale up all circles in the cloud
          nodeGroup.selectAll('circle')
            .transition()
            .duration(200)
            .attr('r', function() {
              const currentR = parseFloat(d3.select(this).attr('r'))
              return currentR * 1.3
            })
            .attr('stroke-width', 3)
        }
        
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
        
        const nodeGroup = d3.select(this)
        
        // For regular nodes, reset circle
        if (d.type !== 'skill') {
          nodeGroup.select('circle')
            .attr('r', 8)
            .attr('stroke-width', 1.5)
        } else {
          // For skill nodes, reset all circles
          nodeGroup.selectAll('circle')
            .transition()
            .duration(200)
            .attr('r', function() {
              const currentR = parseFloat(d3.select(this).attr('r'))
              return currentR / 1.3
            })
            .attr('stroke-width', 2)
        }
        
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

    // Create regions layer (behind everything else)
    const regionsLayer = g.insert('g', ':first-child')
      .attr('class', 'regions-layer')
    
    // Store reference for region updates
    regionElementsRef.current = regionsLayer
    
    // Create projects layer (behind regions layer) - only in universe mode
    let projectsLayer = null
    if (universeMode) {
      projectsLayer = g.insert('g', ':first-child')
        .attr('class', 'projects-layer')
      projectElementsRef.current = projectsLayer
    }
    
    // Track current zoom scale for semantic zoom
    let currentZoomScale = 1
    
    /**
     * Handle semantic zoom - adjust visual elements based on zoom level
     * This creates a smooth transition between detail levels:
     * - Zoomed in (scale > 1): Full detail, all labels visible
     * - Medium (0.5 - 1): Labels start fading
     * - Zoomed out (0.3 - 0.5): Labels hidden, nodes shrink
     * - Far out (< 0.3): Only project hulls visible, nodes are dots
     */
    function handleSemanticZoom(scale) {
      // Calculate opacity values based on zoom scale with smooth transitions
      // Item labels: fade out between 0.5 and 0.3
      const labelOpacity = scale > 0.5 ? 1 : scale < 0.3 ? 0 : (scale - 0.3) / 0.2
      
      // Link labels: fade out between 0.6 and 0.4
      const linkLabelOpacity = scale > 0.6 ? 1 : scale < 0.4 ? 0 : (scale - 0.4) / 0.2
      
      // Node size: shrink when zoomed out (scale < 0.5)
      // At scale 1.0: radius 8, at scale 0.2: radius 4
      const nodeRadius = scale > 0.5 ? 8 : Math.max(3, 8 * (scale / 0.5))
      
      // Apply to item labels with smooth transition
      if (label) {
        label
          .transition()
          .duration(150)
          .attr('opacity', labelOpacity)
          .attr('font-size', scale > 0.5 ? 11 : Math.max(8, 11 * (scale / 0.5)))
      }
      
      // Apply to link labels
      if (linkLabel) {
        linkLabel
          .transition()
          .duration(150)
          .attr('opacity', linkLabelOpacity)
      }
      
      // Apply to nodes (shrink when zoomed out)
      if (node) {
        node
          .transition()
          .duration(150)
          .attr('r', nodeRadius)
      }
      
      // Adjust link opacity when very zoomed out
      const linkOpacity = scale > 0.3 ? 1 : Math.max(0.3, scale / 0.3)
      if (link) {
        link
          .transition()
          .duration(150)
          .attr('stroke-opacity', d => (0.3 + d.similarity * 0.5) * linkOpacity)
      }
    }
    
    // Update zoom behavior to track scale
    zoom.on('zoom', (event) => {
      g.attr('transform', event.transform)
      currentZoomScale = event.transform.k
      setZoomScale(currentZoomScale)
      
      // Apply semantic zoom effects
      handleSemanticZoom(currentZoomScale)
      
      // Update project hulls with new zoom scale (in universe mode)
      if (universeMode && projectsLayer && nodePositionsRef.current.size > 0) {
        // Build projects data with item IDs for hull calculation
        const projectsWithItems = projects.map(p => ({
          ...p,
          itemIds: nodes.filter(n => n.project_id === p.id).map(n => n.id)
        }))
        updateProjectHulls(projectsLayer, projectsWithItems, nodePositionsRef.current, currentZoomScale, hoveredProject)
      }
    })
    
    // Re-apply zoom behavior with updated handler
    svg.call(zoom)

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

      // Position node groups (works for both single circles and cloud groups)
      node
        .attr('transform', d => `translate(${d.x},${d.y})`)

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y)
      
      // Update node positions map for region calculations
      nodes.forEach(n => {
        nodePositionsRef.current.set(n.id, { x: n.x, y: n.y })
      })
      
      // Update region hulls (use ref for hovered state to avoid re-renders)
      updateRegionHulls(regionsLayer, regions, nodePositionsRef.current, hoveredRegionRef.current)
      
      // Update project hulls in universe mode
      if (universeMode && projectsLayer) {
        // Build projects data with item IDs for hull calculation
        const projectsWithItems = projects.map(p => ({
          ...p,
          itemIds: nodes.filter(n => n.project_id === p.id).map(n => n.id)
        }))
        updateProjectHulls(projectsLayer, projectsWithItems, nodePositionsRef.current, currentZoomScale, hoveredProject)
      }
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
  }, [items, allItems, connections, width, height, loading, isDarkMode, regions, universeMode, projectCentroids, projects, hoveredProject])
  
  // Separate effect for region hover updates (doesn't restart simulation)
  useEffect(() => {
    // Update the ref so the tick function can access current value
    hoveredRegionRef.current = hoveredRegion
    
    // Directly update region styling without re-rendering the graph
    if (regionElementsRef.current && nodePositionsRef.current.size > 0) {
      updateRegionHulls(regionElementsRef.current, regions, nodePositionsRef.current, hoveredRegion)
    }
  }, [hoveredRegion, regions])

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
                  : 'bg-card hover:bg-muted text-foreground'
              }`}
            >
              <Tag className="w-5 h-5" />
            </Button>
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
              Themes
              {allThemes.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-card text-foreground rounded text-xs">
                  {allThemes.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Theme Legend Panel */}
      {showThemeLegend && allThemes.length > 0 && (
        <div className="absolute top-20 right-6 bg-card/95 backdrop-blur-md p-4 rounded-lg shadow-xl border border-border max-w-sm max-h-96 overflow-y-auto">
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

      {/* Regions Button - Below Theme button */}
      <div className="absolute top-20 right-6 z-40">
        <div className="group relative">
          <Button
            size="icon"
            onClick={() => setShowRegionsPanel(!showRegionsPanel)}
            className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
              showRegionsPanel
                ? 'bg-black hover:bg-gray-800 text-white'
                : 'bg-card hover:bg-muted text-foreground'
            }`}
          >
            <MapIcon className="w-5 h-5" />
          </Button>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
            Regions
            {regions.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-card text-foreground rounded text-xs">
                {regions.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Regions Panel */}
      {showRegionsPanel && (
        <div className="absolute top-36 right-6 bg-card/95 backdrop-blur-md p-4 rounded-lg shadow-xl border border-border w-80 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Knowledge Regions</h3>
            <button
              onClick={() => setShowRegionsPanel(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* + New Region Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-3 gap-2"
            onClick={handleOpenCreateRegion}
          >
            <Plus className="w-4 h-4" />
            New Region
          </Button>
          
          {regionsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : regions.length === 0 ? (
            <div className="text-center py-4">
              <MapIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No regions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create regions to group related knowledge items
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {regions.map((region) => (
                <div
                  key={region.id}
                  className={`
                    p-3 rounded-lg border transition-all cursor-pointer
                    ${hoveredRegion === region.id 
                      ? 'border-2 shadow-md' 
                      : 'border-border hover:border-muted-foreground/50'
                    }
                  `}
                  style={{
                    borderColor: hoveredRegion === region.id ? region.color : undefined,
                    backgroundColor: hoveredRegion === region.id ? `${region.color}10` : undefined
                  }}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: region.color }}
                      />
                      <span className="font-medium text-sm">{region.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingRegion(region)
                          setShowEditRegionDialog(true)
                        }}
                        title="Edit region & AI profile"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRegionVisibility(region.id)
                        }}
                        title={region.is_visible ? 'Hide region' : 'Show region'}
                      >
                        {region.is_visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          // confirm() is blocked in Tauri's webview — delete directly
                          deleteRegion(region.id)
                        }}
                        title="Delete region"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  {region.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {region.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {region.item_count} item{region.item_count !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {region.region_type}
                    </Badge>
                  </div>
                  
                  {/* Profile Pill - shows when profile is assigned */}
                  {region.profile_id && regionProfiles[region.id] && (
                    <div 
                      className="mt-2 p-2 rounded-lg border flex items-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                      style={{ borderColor: `${region.color}40`, backgroundColor: `${region.color}10` }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingRegion(region)
                        setShowEditRegionDialog(true)
                      }}
                    >
                      <Brain className="w-4 h-4 flex-shrink-0" style={{ color: region.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{regionProfiles[region.id].name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {regionProfiles[region.id].context_strategy?.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">
                            T: {regionProfiles[region.id].temperature}
                          </span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">
                            {regionProfiles[region.id].max_context_items} items
                          </span>
                        </div>
                      </div>
                      <Settings2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </div>
                  )}
                  
                  {/* Loading state for profile */}
                  {region.profile_id && !regionProfiles[region.id] && (
                    <div className="mt-2 p-2 rounded-lg border flex items-center gap-2" style={{ borderColor: `${region.color}40` }}>
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Loading profile...</span>
                    </div>
                  )}
                  
                  {/* Quick Add Profile Button - shows when no profile assigned */}
                  {!region.profile_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-xs gap-1 h-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingRegion(region)
                        setShowEditRegionDialog(true)
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Add AI Profile
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Region Dialog */}
      <Dialog open={showCreateRegionDialog} onOpenChange={setShowCreateRegionDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Region</DialogTitle>
            <DialogDescription>
              Create a region to group related knowledge items together.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Region Name */}
            <div className="space-y-2">
              <Label htmlFor="region-name">Name</Label>
              <Input
                id="region-name"
                placeholder="e.g., Project Research, Design Patterns..."
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                autoFocus
              />
            </div>
            
            {/* Region Description */}
            <div className="space-y-2">
              <Label htmlFor="region-description">Description (optional)</Label>
              <Input
                id="region-description"
                placeholder="What this region contains..."
                value={newRegionDescription}
                onChange={(e) => setNewRegionDescription(e.target.value)}
              />
            </div>
            
            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {REGION_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full transition-all
                      ${newRegionColor === color 
                        ? 'ring-2 ring-offset-2 ring-offset-background scale-110' 
                        : 'hover:scale-110'
                      }
                    `}
                    style={{ 
                      backgroundColor: color,
                      ringColor: color
                    }}
                    onClick={() => setNewRegionColor(color)}
                  >
                    {newRegionColor === color && (
                      <Check className="w-4 h-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Item Selection */}
            <div className="space-y-2">
              <Label>Select Items ({selectedItemIds.length} selected)</Label>
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {items && items.length > 0 ? (
                  <div className="divide-y">
                    {items.map((item) => {
                      const isSelected = selectedItemIds.includes(item.id)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`
                            w-full px-3 py-2 text-left flex items-center gap-3 transition-colors
                            ${isSelected 
                              ? 'bg-primary/10' 
                              : 'hover:bg-muted'
                            }
                          `}
                          onClick={() => toggleItemSelection(item.id)}
                        >
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${isSelected 
                              ? 'border-primary bg-primary' 
                              : 'border-muted-foreground/30'
                            }
                          `}>
                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.item_type}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No items available
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                You can add more items to the region later
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateRegionDialog(false)}
              disabled={isCreatingRegion}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRegion}
              disabled={!newRegionName.trim() || isCreatingRegion}
              style={{ backgroundColor: newRegionColor }}
              className="text-white"
            >
              {isCreatingRegion ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Region
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Zoom Level Indicator - Centered at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card/90 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium tabular-nums">{(zoomScale * 100).toFixed(0)}%</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs text-muted-foreground">
            {zoomScale > 0.5 ? 'Items' : zoomScale > 0.3 ? 'Regions' : 'Projects'}
          </span>
        </div>
      </div>

      {/* Info/Legend Button - Circular like nav items */}
      <div className="absolute bottom-6 right-6 z-40">
        <div className="group relative">
          <Button
            size="icon"
            onClick={() => setShowInfoLegend(!showInfoLegend)}
            className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
              showInfoLegend
                ? 'bg-black hover:bg-gray-800 text-white'
                : 'bg-card hover:bg-muted text-foreground'
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
        <div className="absolute bottom-20 right-6 bg-card/95 backdrop-blur-md p-4 rounded-lg shadow-xl border border-border max-w-sm">
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
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-pink-500 opacity-30 absolute"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-500 opacity-40 absolute top-0.5 left-0.5"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div>
                  </div>
                  <span className="text-xs ml-2">Skills (cloud)</span>
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

      {/* Bottom Sheet - Using shared ItemDetailSheet component */}
      {selectedNode && (
        <ItemDetailSheet
          item={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Edit Region Dialog */}
      <RegionEditDialog
        open={showEditRegionDialog}
        onOpenChange={setShowEditRegionDialog}
        region={editingRegion}
        items={items}
        onSave={async (updatedRegion) => {
          await updateRegion(updatedRegion.id, {
            name: updatedRegion.name,
            description: updatedRegion.description,
            color: updatedRegion.color,
            item_ids: updatedRegion.item_ids
          })
          fetchRegions()
        }}
        onProfileChange={async (regionId) => {
          // Re-fetch the profile for this region to update the cache
          await fetchProfileForRegion(regionId)
          // Also refresh regions to get updated profile_id
          fetchRegions()
        }}
      />
    </div>
  )
}
