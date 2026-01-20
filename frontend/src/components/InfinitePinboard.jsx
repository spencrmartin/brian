import { useState, useCallback, useRef, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LinkPreview from '@/components/LinkPreview'
import { 
  Star, 
  Pencil, 
  Trash2, 
  Link as LinkIcon, 
  FileText, 
  Code2, 
  FileCode,
  ZoomIn,
  ZoomOut,
  Maximize,
  Move
} from 'lucide-react'
import { truncateTitle, truncateText } from '@/lib/utils'
import { updateItemPosition } from '@/lib/api'

export function InfinitePinboard({ 
  items = [], 
  onEdit, 
  onDelete, 
  onToggleFavorite 
}) {
  const [positions, setPositions] = useState({})
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [connectionLine, setConnectionLine] = useState(null)
  const [connections, setConnections] = useState([])
  const transformRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const svgRef = useRef(null)

  // Initialize positions from items data
  useEffect(() => {
    const initialPositions = {}
    items.forEach((item, index) => {
      if (item.pinboard_x !== null && item.pinboard_x !== undefined && 
          item.pinboard_y !== null && item.pinboard_y !== undefined) {
        initialPositions[item.id] = { x: item.pinboard_x, y: item.pinboard_y }
      }
    })
    setPositions(initialPositions)
  }, [items])

  // Load existing connections
  useEffect(() => {
    const loadConnections = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/graph')
        const data = await response.json()
        setConnections(data.connections || [])
      } catch (error) {
        console.error('Failed to load connections:', error)
      }
    }
    loadConnections()
  }, [])

  // Handle connection start
  const handleConnectionStart = (e, itemId) => {
    e.stopPropagation()
    e.preventDefault()
    
    const transformState = transformRef.current?.instance?.transformState
    const scale = transformState?.scale || 1
    const posX = transformState?.positionX || 0
    const posY = transformState?.positionY || 0
    
    const position = getItemPosition(itemId, items.findIndex(i => i.id === itemId))
    
    setConnectingFrom({
      itemId,
      x: position.x + 150, // Center of card (300px wide)
      y: position.y + 100  // Approximate center
    })
    
    setConnectionLine({
      x1: position.x + 150,
      y1: position.y + 100,
      x2: (e.clientX - posX) / scale,
      y2: (e.clientY - posY) / scale
    })
  }

  // Handle connection move
  const handleConnectionMove = useCallback((e) => {
    if (!connectingFrom) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const transformState = transformRef.current?.instance?.transformState
    const scale = transformState?.scale || 1
    const posX = transformState?.positionX || 0
    const posY = transformState?.positionY || 0
    
    setConnectionLine({
      x1: connectingFrom.x,
      y1: connectingFrom.y,
      x2: (e.clientX - posX) / scale,
      y2: (e.clientY - posY) / scale
    })
  }, [connectingFrom])

  // Handle connection end
  const handleConnectionEnd = async (itemId) => {
    if (!connectingFrom || connectingFrom.itemId === itemId) {
      setConnectingFrom(null)
      setConnectionLine(null)
      return
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_item_id: connectingFrom.itemId,
          target_item_id: itemId,
          connection_type: 'related',
          strength: 1.0
        })
      })
      
      if (response.ok) {
        const newConnection = await response.json()
        setConnections(prev => [...prev, newConnection])
        console.log('Connection created:', newConnection)
      }
    } catch (error) {
      console.error('Failed to create connection:', error)
    }

    setConnectingFrom(null)
    setConnectionLine(null)
  }

  const getTypeIcon = (type) => {
    const iconMap = {
      link: LinkIcon,
      note: FileText,
      code: Code2,
      paper: FileCode
    }
    const Icon = iconMap[type] || FileText
    return <Icon className="w-5 h-5" />
  }

  // Initialize positions for items that don't have one
  const getItemPosition = useCallback((itemId, index) => {
    if (positions[itemId]) {
      return positions[itemId]
    }
    
    // Arrange items in a grid pattern initially
    const cols = 4
    const row = Math.floor(index / cols)
    const col = index % cols
    const spacing = 350
    
    return {
      x: col * spacing + 100,
      y: row * spacing + 100
    }
  }, [positions])

  const handleMouseDown = (e, itemId) => {
    // Only start drag if clicking on the drag handle
    if (!e.target.closest('.drag-handle')) return
    
    e.stopPropagation()
    e.preventDefault()
    setDraggingId(itemId)
    
    const position = getItemPosition(itemId, items.findIndex(i => i.id === itemId))
    
    // Get the current transform state to account for zoom/pan
    const transformState = transformRef.current?.instance?.transformState
    const scale = transformState?.scale || 1
    const posX = transformState?.positionX || 0
    const posY = transformState?.positionY || 0
    
    // Calculate offset accounting for current transform
    setDragOffset({
      x: (e.clientX - posX) / scale - position.x,
      y: (e.clientY - posY) / scale - position.y
    })
  }

  const handleMouseMove = useCallback((e) => {
    if (!draggingId) return
    
    e.preventDefault()
    e.stopPropagation()
    
    // Get the current transform state
    const transformState = transformRef.current?.instance?.transformState
    const scale = transformState?.scale || 1
    const posX = transformState?.positionX || 0
    const posY = transformState?.positionY || 0
    
    // Calculate new position accounting for zoom and pan
    const newX = (e.clientX - posX) / scale - dragOffset.x
    const newY = (e.clientY - posY) / scale - dragOffset.y
    
    setPositions(prev => ({
      ...prev,
      [draggingId]: { x: newX, y: newY }
    }))
  }, [draggingId, dragOffset])

  const handleMouseUp = useCallback(() => {
    if (draggingId) {
      const position = positions[draggingId]
      if (position) {
        // Debounce the save to avoid too many API calls
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        
        saveTimeoutRef.current = setTimeout(async () => {
          try {
            await updateItemPosition(draggingId, position.x, position.y)
            console.log(`Saved position for ${draggingId}:`, position)
          } catch (error) {
            console.error('Failed to save position:', error)
          }
        }, 500)
      }
    }
    setDraggingId(null)
  }, [draggingId, positions])

  return (
    <div className="w-full h-full bg-gray-50 overflow-hidden relative">
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.3}
        maxScale={2}
        centerOnInit={false}
        limitToBounds={false}
        disablePadding={true}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: true }}
        panning={{ 
          disabled: draggingId !== null,
          velocityDisabled: true
        }}
        alignmentAnimation={{ disabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={() => zoomIn()}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={() => zoomOut()}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={() => resetTransform()}
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{
                width: '100%',
                height: '100%',
              }}
              contentStyle={{
                width: '100%',
                height: '100%',
              }}
            >
              <div 
                className="relative"
                style={{
                  width: '5000px',
                  height: '5000px',
                  backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
                onMouseMove={(e) => {
                  handleMouseMove(e)
                  handleConnectionMove(e)
                }}
                onMouseUp={(e) => {
                  handleMouseUp()
                  // Only clear connection if not dropped on a card
                  if (connectingFrom) {
                    setConnectingFrom(null)
                    setConnectionLine(null)
                  }
                }}
              >
                {/* SVG layer for connections */}
                <svg
                  ref={svgRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: '5000px', height: '5000px' }}
                >
                  {/* Draw existing connections */}
                  {connections.map((conn, idx) => {
                    const sourceItem = items.find(i => i.id === conn.source_item_id)
                    const targetItem = items.find(i => i.id === conn.target_item_id)
                    if (!sourceItem || !targetItem) return null
                    
                    const sourcePos = getItemPosition(sourceItem.id, items.indexOf(sourceItem))
                    const targetPos = getItemPosition(targetItem.id, items.indexOf(targetItem))
                    
                    return (
                      <line
                        key={`conn-${idx}`}
                        x1={sourcePos.x + 150}
                        y1={sourcePos.y + 100}
                        x2={targetPos.x + 150}
                        y2={targetPos.y + 100}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.5"
                      />
                    )
                  })}
                  
                  {/* Draw connection line being created */}
                  {connectionLine && (
                    <line
                      x1={connectionLine.x1}
                      y1={connectionLine.y1}
                      x2={connectionLine.x2}
                      y2={connectionLine.y2}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      opacity="0.7"
                    />
                  )}
                </svg>
                {items.map((item, index) => {
                  const position = getItemPosition(item.id, index)
                  
                  return (
                    <div
                      key={item.id}
                      className={`absolute group ${
                        draggingId === item.id ? 'opacity-70 cursor-grabbing' : 'cursor-default'
                      }`}
                      style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        width: '300px',
                        pointerEvents: draggingId && draggingId !== item.id ? 'none' : 'auto',
                      }}
                      onMouseDown={(e) => handleMouseDown(e, item.id)}
                      onMouseUp={() => handleConnectionEnd(item.id)}
                    >
                      {/* Connection handles on card edges - only visible on hover */}
                      <div
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-crosshair hover:bg-blue-600 hover:scale-110 transition-all z-10 border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        onMouseDown={(e) => handleConnectionStart(e, item.id)}
                        title="Drag to connect to another card"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-crosshair hover:bg-blue-600 hover:scale-110 transition-all z-10 border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        onMouseDown={(e) => handleConnectionStart(e, item.id)}
                        title="Drag to connect to another card"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -top-3 w-6 h-6 bg-blue-500 rounded-full cursor-crosshair hover:bg-blue-600 hover:scale-110 transition-all z-10 border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        onMouseDown={(e) => handleConnectionStart(e, item.id)}
                        title="Drag to connect to another card"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-6 h-6 bg-blue-500 rounded-full cursor-crosshair hover:bg-blue-600 hover:scale-110 transition-all z-10 border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        onMouseDown={(e) => handleConnectionStart(e, item.id)}
                        title="Drag to connect to another card"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      
                      {/* Visual indicator when this card is a valid drop target */}
                      {connectingFrom && connectingFrom.itemId !== item.id && (
                        <div className="absolute inset-0 border-4 border-blue-400 rounded-lg pointer-events-none animate-pulse bg-blue-50 bg-opacity-20"></div>
                      )}
                      {item.item_type === 'link' ? (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                          {/* Action buttons for link items with drag handle */}
                          <div className="drag-handle flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                              <Move className="w-4 h-4 text-gray-400" />
                              {getTypeIcon(item.item_type)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(item.id)
                                }}
                                title={item.is_favorite ? 'Unfavorite' : 'Favorite'}
                              >
                                <Star className={`w-3 h-3 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEdit(item)
                                }}
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(item)
                                }}
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Link preview card */}
                          <LinkPreview item={item} />
                          
                          {/* Tags below preview */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 p-3 border-t border-gray-200 bg-gray-50">
                              {item.tags.slice(0, 2).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {item.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Card className="hover:shadow-xl transition-all flex flex-col h-full">
                        <CardHeader className="pb-3">
                          <div className="drag-handle flex items-start justify-between gap-2 mb-2 cursor-grab active:cursor-grabbing">
                            <div className="flex items-center gap-2">
                              <Move className="w-4 h-4 text-gray-400" />
                              {getTypeIcon(item.item_type)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(item.id)
                                }}
                                title={item.is_favorite ? 'Unfavorite' : 'Favorite'}
                              >
                                <Star className={`w-3 h-3 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEdit(item)
                                }}
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDelete(item)
                                }}
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle 
                            className="text-base font-light leading-snug line-clamp-2" 
                            title={item.title}
                          >
                            {truncateTitle(item.title, 50)}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {new Date(item.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex-1 pb-3">
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {truncateText(item.content, 100)}
                          </p>
                          
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LinkIcon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{new URL(item.url).hostname}</span>
                            </a>
                          )}
                          
                          {item.language && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">{item.language}</Badge>
                            </div>
                          )}
                        </CardContent>
                        
                        {item.tags && item.tags.length > 0 && (
                          <CardFooter className="pt-3 border-t flex flex-wrap gap-1.5">
                            {item.tags.slice(0, 2).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.tags.length - 2}
                              </Badge>
                            )}
                          </CardFooter>
                        )}
                      </Card>
                      )}
                    </div>
                  )
                })}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
