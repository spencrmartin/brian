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
  Brain,
  Image as ImageIcon
} from 'lucide-react'
import { truncateTitle } from '@/lib/utils'
import { getApiBaseUrl } from '@/lib/backend'
import ContentPreview from '@/components/ContentPreview'
import { ItemDetailSheet } from '@/components/ItemDetailSheet'
import { useSettings } from '@/contexts/SettingsContext'
import PixelBlast from '@/components/PixelBlast'
import { getUserName } from '@/components/Onboarding'

export default function HomeView({ items, loadItems, onEdit, onDelete, onToggleFavorite }) {
  const { accentColor, temperatureUnit } = useSettings()
  const [weather, setWeather] = useState(null)
  const [loadingWeather, setLoadingWeather] = useState(true)
  const [detailItem, setDetailItem] = useState(null)

  // Update URL hash when item detail opens/closes for deep linking
  const openItemDetail = (item) => {
    setDetailItem(item)
    if (item) window.location.hash = `#/item/${item.id}`
  }
  const closeItemDetail = () => {
    setDetailItem(null)
    window.location.hash = '#/'
  }
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    // Initial check
    checkDarkMode()
    
    // Watch for changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })
    
    return () => observer.disconnect()
  }, [])

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
      skill: Brain,
      image: ImageIcon
    }
    const Icon = iconMap[type] || FileText
    return <Icon className="w-6 h-6" />
  }

  // Resolve image source — base64 data URL or legacy /api/v1/images/ path
  const resolveImageUrl = (item) => {
    if (item.item_type !== 'image') return null
    const src = item.url || item.content
    if (!src) return null
    // Legacy items store /api/v1/images/... — need full backend URL
    if (src.startsWith('/api/')) {
      return `${getApiBaseUrl().replace('/api/v1', '')}${src}`
    }
    return src  // data:image/...;base64,... or full URL
  }

  // Simple graph preview data
  const graphStats = {
    totalNodes: items.length,
    connections: Math.floor(items.length * 1.5), // Rough estimate
    clusters: Math.ceil(items.length / 5)
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto pt-24 md:pt-40 px-4 md:px-32">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 md:mb-16"
        >
          <h1 className="text-5xl font-light mb-2">
            {items.length <= 1
              ? `Welcome${getUserName() ? `, ${getUserName()}` : ''}`
              : `Welcome back${getUserName() ? `, ${getUserName()}` : ''}`}
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            {items.length === 0
              ? 'Start building your knowledge universe'
              : 'Your knowledge universe at a glance'}
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-0.5">
          
          {/* Left Column - PixelBlast + Did you know */}
          <div className="flex flex-col gap-0.5">
            {/* PixelBlast Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`relative h-32 rounded-3xl overflow-hidden ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-200 via-gray-100 to-white'
                  : 'bg-gradient-to-br from-foreground/90 via-foreground/80 to-foreground/70'
              }`}>
                {/* PixelBlast Effect */}
                <div className="absolute inset-0">
                  <PixelBlast
                    pixelSize={3}
                    color={accentColor}
                    patternScale={2.5}
                    patternDensity={1.2}
                    speed={0.4}
                    edgeFade={0}
                  />
                </div>
              </div>
            </motion.div>
          
            {/* Cool Fact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={`relative overflow-hidden backdrop-blur-xl h-[428px] group hover:shadow-2xl transition-all duration-300 rounded-3xl ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-200 via-gray-100 to-white border-gray-300'
                  : 'bg-gradient-to-br from-foreground/90 via-foreground/80 to-foreground/70 border-foreground/20'
              }`}>
                {/* Frosted overlay effect */}
                <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
                  isDarkMode ? 'from-white/20' : 'from-black/10'
                } to-transparent`} />
                
                <div className="relative p-8 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800/20' : 'bg-background/20'}`}>
                      <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-gray-800' : 'text-background'}`} />
                    </div>
                    <h3 className={`text-lg font-light ${isDarkMode ? 'text-gray-800' : 'text-background'}`}>Did you know?</h3>
                  </div>
                  
                  <p className={`text-2xl font-light leading-relaxed ${isDarkMode ? 'text-gray-800' : 'text-background'}`}>
                    {randomFact}
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Recent Item Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className={`relative overflow-hidden backdrop-blur-xl h-[560px] group hover:shadow-2xl transition-all duration-300 rounded-3xl cursor-pointer ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-200 via-gray-100 to-white border-gray-300'
                  : 'bg-gradient-to-br from-foreground/90 via-foreground/80 to-foreground/70 border-foreground/20'
              }`}
              onClick={() => recentItem && openItemDetail(recentItem)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
                isDarkMode ? 'from-white/20' : 'from-black/10'
              } to-transparent`} />
              
              <div className="relative p-8 h-full flex flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800/20' : 'bg-background/20'}`}>
                    <Clock className={`w-5 h-5 ${isDarkMode ? 'text-gray-800' : 'text-background'}`} />
                  </div>
                  <h3 className={`text-lg font-light ${isDarkMode ? 'text-gray-800' : 'text-background'}`}>Recent Activity</h3>
                </div>
                
                {recentItem ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={isDarkMode ? 'text-gray-800' : 'text-background'}>{getTypeIcon(recentItem.item_type)}</div>
                      <Badge variant="secondary" className={`text-xs ${
                        isDarkMode
                          ? 'bg-gray-800/20 text-gray-800 border-gray-800/30'
                          : 'bg-background/20 text-background border-background/30'
                      }`}>
                        {recentItem.item_type}
                      </Badge>
                    </div>
                    <h4 className={`text-xl font-light mb-2 line-clamp-2 ${isDarkMode ? 'text-gray-800' : 'text-background'}`}>
                      {truncateTitle(recentItem.title, 60)}
                    </h4>
                    <p className={`text-sm line-clamp-3 ${isDarkMode ? 'text-gray-700' : 'text-background/70'}`}>
                      <ContentPreview content={recentItem.content} maxLength={150} />
                    </p>
                  </div>
                ) : (
                  <div className={isDarkMode ? 'text-gray-600' : 'text-background/60'}>
                    <p className="text-sm">No items yet</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Weather + PixelBlast */}
          <div className="flex flex-col gap-0.5">
            {/* Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={`relative overflow-hidden backdrop-blur-xl h-[428px] group hover:shadow-2xl transition-all duration-300 rounded-3xl ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-200 via-gray-100 to-white border-gray-300'
                  : 'bg-gradient-to-br from-foreground/90 via-foreground/80 to-foreground/70 border-foreground/20'
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
                  isDarkMode ? 'from-white/20' : 'from-black/10'
                } to-transparent`} />
                
                <div className="relative p-8 h-full flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800/20' : 'bg-background/20'}`}>
                      <Cloud className={`w-5 h-5 ${isDarkMode ? 'text-gray-800' : 'text-background'}`} />
                    </div>
                    <h3 className={`text-lg font-light ${isDarkMode ? 'text-gray-800' : 'text-background'}`}>Local Weather</h3>
                  </div>
                  
                  {loadingWeather ? (
                    <div className={isDarkMode ? 'text-gray-600' : 'text-background/60'}>
                      <div className="animate-pulse">Loading...</div>
                    </div>
                  ) : weather ? (
                    <div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className={`text-5xl font-light ${isDarkMode ? 'text-gray-800' : 'text-background'}`}>
                          {temperatureUnit === 'C' 
                            ? weather.current_condition?.[0]?.temp_C 
                            : weather.current_condition?.[0]?.temp_F}°
                        </span>
                        <span className={`text-xl ${isDarkMode ? 'text-gray-700' : 'text-background/70'}`}>
                          {temperatureUnit}
                        </span>
                      </div>
                      <p className={`text-lg font-light ${isDarkMode ? 'text-gray-800' : 'text-background'}`}>
                        {weather.current_condition?.[0]?.weatherDesc?.[0]?.value}
                      </p>
                    </div>
                  ) : (
                    <div className={isDarkMode ? 'text-gray-600' : 'text-background/60'}>
                      <p className="text-sm">Weather unavailable</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* PixelBlast Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className={`relative h-32 rounded-3xl overflow-hidden ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-200 via-gray-100 to-white'
                  : 'bg-gradient-to-br from-foreground/90 via-foreground/80 to-foreground/70'
              }`}>
                {/* PixelBlast Effect */}
                <div className="absolute inset-0">
                  <PixelBlast
                    pixelSize={3}
                    color={accentColor}
                    patternScale={2.5}
                    patternDensity={1.2}
                    speed={0.4}
                    edgeFade={0}
                  />
                </div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Feed Section */}
        <div className="mt-16">
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
            <div className="space-y-12">
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
                      {dateItems.map((item) => {
                        const imageUrl = resolveImageUrl(item)
                        
                        // Image items: just the photo, nothing else
                        if (imageUrl) {
                          return (
                            <Card 
                              key={item.id}
                              className="relative overflow-hidden border-border/50 hover:shadow-2xl transition-all duration-300 rounded-3xl cursor-pointer group"
                              onClick={() => openItemDetail(item)}
                            >
                              <img 
                                src={imageUrl} 
                                alt={item.title}
                                className="w-full object-cover"
                                style={{ minHeight: '200px', maxHeight: '300px' }}
                                loading="lazy"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                            </Card>
                          )
                        }
                        
                        // Regular card for non-image items
                        return (
                          <Card 
                            key={item.id}
                            className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-background/80 via-background/50 to-background/30 border-border/50 hover:shadow-2xl transition-all duration-300 rounded-3xl cursor-pointer group"
                            onClick={() => openItemDetail(item)}
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
                              {item.url && item.item_type !== 'image' && (
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
                        )
                      })}
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
          onClose={closeItemDetail}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </div>
  )
}
