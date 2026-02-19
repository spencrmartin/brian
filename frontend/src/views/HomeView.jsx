import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Clock, 
  Cloud, 
  Network,
  ExternalLink,
  TrendingUp,
  Droplets,
  Wind,
  Link as LinkIcon,
  FileText,
  Code2,
  FileCode,
  Brain
} from 'lucide-react'
import { truncateTitle } from '@/lib/utils'
import ContentPreview from '@/components/ContentPreview'
import { useKnowledge } from '@/hooks/useKnowledge'
import { ItemDetailSheet } from '@/components/ItemDetailSheet'

export default function HomeView({ onEdit, onDelete, onToggleFavorite }) {
  const { items, loadItems } = useKnowledge()
  const [weather, setWeather] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [detailItem, setDetailItem] = useState(null)

  useEffect(() => {
    loadItems()
    fetchWeather()
  }, [loadItems])

  const fetchWeather = async () => {
    try {
      // Using wttr.in for simple weather without API key
      const response = await fetch('https://wttr.in/?format=j1')
      const data = await response.json()
      setWeather(data)
    } catch (error) {
      console.error('Failed to fetch weather:', error)
    } finally {
      setLoadingWeather(false)
    }
  }

  // Get random cool fact
  const facts = [
    "Octopuses have three hearts and blue blood",
    "Honey never spoils - archaeologists found 3000-year-old honey that was still edible",
    "A day on Venus is longer than a year on Venus",
    "Bananas are berries, but strawberries aren't",
    "The shortest war in history lasted 38 minutes",
    "There are more stars in the universe than grains of sand on Earth",
    "A group of flamingos is called a 'flamboyance'",
    "The human brain uses 20% of the body's energy",
    "Lightning strikes the Earth 100 times every second",
    "The Eiffel Tower can be 15 cm taller during summer due to thermal expansion",
    "Sharks existed before trees",
    "A single cloud can weigh more than a million pounds",
    "Cleopatra lived closer to the moon landing than to the construction of the Great Pyramid",
    "There are more possible iterations of a game of chess than atoms in the known universe",
    "Your brain is more active when you're asleep than when watching TV"
  ]
  
  const [randomFact] = useState(() => facts[Math.floor(Math.random() * facts.length)])

  // Get most recent item
  const recentItem = items.length > 0 
    ? [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    : null

  // Get item type icon component
  const getTypeIcon = (type) => {
    const iconMap = {
      link: LinkIcon,
      note: FileText,
      code: Code2,
      paper: FileCode,
      skill: Brain
    }
    const Icon = iconMap[type] || FileText
    return <Icon className="w-6 h-6" />
  }

  // Simple graph preview data
  const graphStats = {
    totalNodes: items.length,
    connections: Math.floor(items.length * 1.5), // Rough estimate
    clusters: Math.ceil(items.length / 5)
  }

  return (
    <div className="min-h-screen p-8 pt-32">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-light mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-lg font-light">
            Your knowledge universe at a glance
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0.5">
          
          {/* Cool Fact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-background/50 to-background/50 border-purple-500/20 h-[280px] group hover:shadow-2xl transition-all duration-300 rounded-3xl">
              {/* Frosted overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-purple-500/20">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-light text-purple-400">Did you know?</h3>
                </div>
                
                <p className="text-2xl font-light leading-relaxed flex-1">
                  {randomFact}
                </p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                  <TrendingUp className="w-3 h-3" />
                  <span>Random knowledge</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recent Item Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-background/50 to-background/50 border-blue-500/20 h-[280px] group hover:shadow-2xl transition-all duration-300 rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-blue-500/20">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-light text-blue-400">Recent Activity</h3>
                </div>
                
                {recentItem ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{getTypeIcon(recentItem.item_type)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {recentItem.item_type}
                        </Badge>
                      </div>
                      <h4 className="text-xl font-light mb-2 line-clamp-2">
                        {truncateTitle(recentItem.title, 60)}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        <ContentPreview content={recentItem.content} maxLength={100} />
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-muted-foreground">
                        {new Date(recentItem.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {recentItem.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => window.open(recentItem.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">No items yet</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Weather Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 via-background/50 to-background/50 border-cyan-500/20 h-[280px] group hover:shadow-2xl transition-all duration-300 rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-cyan-500/20">
                    <Cloud className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-light text-cyan-400">Local Weather</h3>
                </div>
                
                {loadingWeather ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground">Loading...</div>
                  </div>
                ) : weather ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-5xl font-light">
                          {weather.current_condition?.[0]?.temp_F}°
                        </span>
                        <span className="text-xl text-muted-foreground">F</span>
                      </div>
                      <p className="text-lg font-light mb-4">
                        {weather.current_condition?.[0]?.weatherDesc?.[0]?.value}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Humidity</p>
                          <p className="text-sm font-light">
                            {weather.current_condition?.[0]?.humidity}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-cyan-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Wind</p>
                          <p className="text-sm font-light">
                            {weather.current_condition?.[0]?.windspeedMiles} mph
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Weather unavailable</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Graph Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 via-background/50 to-background/50 border-emerald-500/20 h-[280px] group hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              <div className="relative p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-full bg-emerald-500/20">
                    <Network className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-light text-emerald-400">Knowledge Graph</h3>
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  {/* Graph visualization */}
                  <div className="flex-1 flex items-center justify-center relative min-h-[120px]">
                    {graphStats.totalNodes > 0 ? (
                      <div className="relative w-full h-full">
                        {/* Connection lines - render first so they appear behind nodes */}
                        <svg className="absolute inset-0 w-full h-full">
                          {[...Array(Math.min(graphStats.totalNodes, 12))].map((_, i) => {
                            // Create connections between adjacent nodes
                            const nextIndex = (i + 1) % Math.min(graphStats.totalNodes, 12)
                            const x1 = 15 + (i % 4) * 23
                            const y1 = 25 + Math.floor(i / 4) * 33
                            const x2 = 15 + (nextIndex % 4) * 23
                            const y2 = 25 + Math.floor(nextIndex / 4) * 33
                            
                            return (
                              <motion.line
                                key={`line-${i}`}
                                x1={`${x1}%`}
                                y1={`${y1}%`}
                                x2={`${x2}%`}
                                y2={`${y2}%`}
                                stroke="currentColor"
                                strokeWidth="1"
                                className="text-emerald-400/30"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{
                                  duration: 1,
                                  delay: 0.4 + i * 0.05,
                                  ease: "easeInOut"
                                }}
                              />
                            )
                          })}
                        </svg>
                        
                        {/* Nodes */}
                        {[...Array(Math.min(graphStats.totalNodes, 12))].map((_, i) => (
                          <motion.div
                            key={`node-${i}`}
                            className="absolute rounded-full bg-emerald-400"
                            style={{
                              left: `${15 + (i % 4) * 23}%`,
                              top: `${25 + Math.floor(i / 4) * 33}%`,
                              width: '8px',
                              height: '8px',
                              transform: 'translate(-50%, -50%)',
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: [0, 1.2, 1],
                              opacity: [0, 1, 0.8],
                            }}
                            transition={{
                              duration: 0.6,
                              delay: 0.4 + i * 0.05,
                              ease: "easeOut"
                            }}
                          />
                        ))}
                        
                        {/* Pulsing effect on random nodes */}
                        {[...Array(Math.min(3, graphStats.totalNodes))].map((_, i) => {
                          const nodeIndex = i * 4 // Select every 4th node
                          return (
                            <motion.div
                              key={`pulse-${i}`}
                              className="absolute rounded-full bg-emerald-400/20"
                              style={{
                                left: `${15 + (nodeIndex % 4) * 23}%`,
                                top: `${25 + Math.floor(nodeIndex / 4) * 33}%`,
                                width: '8px',
                                height: '8px',
                                transform: 'translate(-50%, -50%)',
                              }}
                              animate={{
                                scale: [1, 2.5, 1],
                                opacity: [0.5, 0, 0.5],
                              }}
                              transition={{
                                duration: 2,
                                delay: i * 0.7,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        No items yet
                      </div>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-2xl font-light">{graphStats.totalNodes}</p>
                      <p className="text-xs text-muted-foreground">Nodes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-light">{graphStats.connections}</p>
                      <p className="text-xs text-muted-foreground">Links</p>
                    </div>
                    <div>
                      <p className="text-2xl font-light">{graphStats.clusters}</p>
                      <p className="text-xs text-muted-foreground">Clusters</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Feed Section */}
        <div className="mt-8">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center py-12 text-muted-foreground"
            >
              <p className="text-lg">No items yet</p>
              <p className="text-sm mt-2">Click "+ New" to add your first knowledge item</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {(() => {
                // Group items by date
                const itemsByDate = items.reduce((acc, item) => {
                  const date = new Date(item.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                  if (!acc[date]) {
                    acc[date] = []
                  }
                  acc[date].push(item)
                  return acc
                }, {})

                // Render each date group
                return Object.entries(itemsByDate).map(([date, dateItems], groupIndex) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + groupIndex * 0.1 }}
                  >
                    {/* Date Header */}
                    <h3 className="text-lg font-light text-foreground mb-4 pb-2 border-b">
                      {date}
                    </h3>
                    
                    {/* Items Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5">
                      {dateItems.map((item) => (
                        <Card 
                          key={item.id}
                          className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-background/80 via-background/50 to-background/30 border-border/50 hover:shadow-2xl transition-all duration-300 rounded-3xl cursor-pointer group"
                          onClick={() => setDetailItem(item)}
                        >
                          {/* Frosted overlay effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                          
                          <div className="relative p-6 h-full flex flex-col">
                            {/* Header with icon and type */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-accent/10">
                                  {getTypeIcon(item.item_type)}
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {item.item_type}
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(item.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </span>
                            </div>

                            {/* Title */}
                            <h4 className="text-lg font-light mb-2 line-clamp-2 leading-snug">
                              {truncateTitle(item.title, 70)}
                            </h4>

                            {/* Content Preview */}
                            <div className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                              <ContentPreview content={item.content} maxLength={150} />
                            </div>

                            {/* URL if exists */}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:underline flex items-center gap-1 truncate mb-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkIcon className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{new URL(item.url).hostname}</span>
                              </a>
                            )}

                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/50">
                                {item.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{item.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                ))
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Bottom Sheet */}
      {detailItem && (
        <ItemDetailSheet
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  )
}
