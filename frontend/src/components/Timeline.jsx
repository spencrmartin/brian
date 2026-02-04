import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Star, 
  Pencil, 
  Trash2, 
  Link as LinkIcon, 
  FileText, 
  Code2, 
  FileCode
} from 'lucide-react'
import { truncateTitle } from '@/lib/utils'
import LinkPreview from './LinkPreview'
import { ProjectPill } from './ProjectPill'
import { ItemDetailSheet } from './ItemDetailSheet'
import ContentPreview from './ContentPreview'

export function Timeline({ 
  items = [], 
  onEdit, 
  onDelete, 
  onToggleFavorite 
}) {
  const [selectedItem, setSelectedItem] = useState(null)
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

  // Generate consistent colors for tags
  const getTagColor = (tag) => {
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
    
    // Simple hash function to get consistent color for tag
    let hash = 0
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // Sort items by date (newest first)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    )
  }, [items])

  // Build tag connections - find items that share tags
  const tagConnections = useMemo(() => {
    const connections = []
    const tagMap = new Map()

    // Build a map of tags to items
    sortedItems.forEach((item, index) => {
      if (item.tags && item.tags.length > 0) {
        item.tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, [])
          }
          tagMap.get(tag).push({ item, index })
        })
      }
    })

    // Create connections between items that share tags
    tagMap.forEach((itemsWithTag, tag) => {
      if (itemsWithTag.length > 1) {
        // Connect consecutive items with the same tag
        for (let i = 0; i < itemsWithTag.length - 1; i++) {
          const from = itemsWithTag[i]
          const to = itemsWithTag[i + 1]
          connections.push({
            from: from.index,
            to: to.index,
            tag: tag,
            color: getTagColor(tag)
          })
        }
      }
    })

    return connections
  }, [sortedItems])

  // Group items by date
  const groupedByDate = useMemo(() => {
    const groups = {}
    const today = new Date().toDateString()
    
    sortedItems.forEach((item, index) => {
      const itemDate = new Date(item.created_at)
      const isToday = itemDate.toDateString() === today
      
      const date = isToday 
        ? 'Today'
        : itemDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
      
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push({ ...item, timelineIndex: index })
    })
    return groups
  }, [sortedItems])

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      {/* SVG for tag connections */}
      <svg 
        className="absolute left-0 top-0 w-full h-full pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {tagConnections.map((connection, idx) => {
          const cardHeight = 280 // Approximate card height including spacing
          const cardMargin = 96 // Where cards start (ml-24 = 96px)
          const fromY = connection.from * cardHeight + 100 // From card center-left
          const toY = connection.to * cardHeight + 100 // To card center-left
          const cardLeftEdge = cardMargin // Left edge of cards
          const horizontalOffset = 40 + (idx % 3) * 20 // Distance to go left from card
          const radius = 10 // Corner radius for rounded turns
          
          // Determine if going down or up
          const goingDown = toY > fromY
          
          // Create path with rounded 90-degree turns from card to card
          // Path goes: card -> left -> down/up -> right -> card
          let path
          
          if (goingDown) {
            // Going down
            path = `
              M ${cardLeftEdge} ${fromY}
              L ${cardLeftEdge - horizontalOffset + radius} ${fromY}
              Q ${cardLeftEdge - horizontalOffset} ${fromY} ${cardLeftEdge - horizontalOffset} ${fromY + radius}
              L ${cardLeftEdge - horizontalOffset} ${toY - radius}
              Q ${cardLeftEdge - horizontalOffset} ${toY} ${cardLeftEdge - horizontalOffset + radius} ${toY}
              L ${cardLeftEdge} ${toY}
            `
          } else {
            // Going up
            path = `
              M ${cardLeftEdge} ${fromY}
              L ${cardLeftEdge - horizontalOffset + radius} ${fromY}
              Q ${cardLeftEdge - horizontalOffset} ${fromY} ${cardLeftEdge - horizontalOffset} ${fromY - radius}
              L ${cardLeftEdge - horizontalOffset} ${toY + radius}
              Q ${cardLeftEdge - horizontalOffset} ${toY} ${cardLeftEdge - horizontalOffset + radius} ${toY}
              L ${cardLeftEdge} ${toY}
            `
          }
          
          return (
            <path
              key={`${connection.from}-${connection.to}-${idx}`}
              d={path}
              stroke={connection.color}
              strokeWidth="2.5"
              fill="none"
              opacity="0.6"
              strokeDasharray="5,5"
            />
          )
        })}
      </svg>

      {/* Timeline items */}
      <div className="space-y-8 relative" style={{ zIndex: 1 }}>
        {Object.entries(groupedByDate).map(([date, dateItems]) => (
          <div key={date} className="space-y-4">
            {/* Date header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-black text-white font-light text-sm">
                {new Date(dateItems[0].created_at).getDate()}
              </div>
              <div>
                <h3 className="text-lg font-light">{date}</h3>
                <p className="text-sm text-muted-foreground">
                  {dateItems.length} item{dateItems.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Items for this date */}
            <div className="ml-24 space-y-4">
              {dateItems.map((item) => (
                <div 
                  key={item.id} 
                  className="relative cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Connection dot */}
                  <div className="absolute -left-[4.5rem] top-6 w-4 h-4 rounded-full bg-card border-4 border-foreground z-10" />
                  
                  {/* Render link preview for link items, regular card for others */}
                  {item.item_type === 'link' ? (
                    <div className="space-y-2">
                      {/* Action buttons for link items */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.item_type)}
                          {item.project_id && (
                            <ProjectPill projectId={item.project_id} size="sm" />
                          )}
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
                            {new Date(item.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit'
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
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {item.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${getTagColor(tag)}20`,
                                borderColor: getTagColor(tag),
                                color: getTagColor(tag),
                                borderWidth: '1px'
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card className="hover:shadow-lg transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.item_type)}
                            {item.project_id && (
                              <ProjectPill projectId={item.project_id} size="sm" />
                            )}
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
                              {new Date(item.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
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
                        <CardTitle 
                          className="text-base font-normal leading-snug" 
                          title={item.title}
                        >
                          {truncateTitle(item.title, 80)}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {item.item_type}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pb-3">
                        <div className="mb-3">
                          <ContentPreview content={item.content} maxLength={200} />
                        </div>
                        
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 truncate mb-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LinkIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{new URL(item.url).hostname}</span>
                          </a>
                        )}
                        
                        {item.language && (
                          <div className="mb-3">
                            <Badge variant="outline" className="text-xs">{item.language}</Badge>
                          </div>
                        )}
                        
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.tags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: `${getTagColor(tag)}20`,
                                  borderColor: getTagColor(tag),
                                  color: getTagColor(tag),
                                  borderWidth: '1px'
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Bottom Sheet */}
      {selectedItem && (
        <ItemDetailSheet
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  )
}
