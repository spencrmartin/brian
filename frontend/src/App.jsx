import { useState, useEffect } from 'react'
import { useKnowledge } from '@/hooks/useKnowledge'
import { useSettings } from '@/contexts/SettingsContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NewItemDialog } from '@/components/NewItemDialog'
import { EditItemDialog } from '@/components/EditItemDialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { BrainLogo } from '@/components/BrainLogo'
import { ProjectSelector } from '@/components/ProjectSelector'
import { ProjectPill } from '@/components/ProjectPill'
import { SimilarityGraph } from '@/components/SimilarityGraph'
import { InfinitePinboard } from '@/components/InfinitePinboard'
import { Timeline } from '@/components/Timeline'
import { Settings } from '@/components/Settings'
import HomeView from '@/views/HomeView'
import LinkPreview from '@/components/LinkPreview'
import Antigravity from '@/components/animations/Antigravity'
import { ItemDetailSheet } from '@/components/ItemDetailSheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { truncateTitle } from '@/lib/utils'
import ContentPreview from '@/components/ContentPreview'
import { 
  Plus, 
  Settings as SettingsIcon, 
  Star, 
  Pencil, 
  Trash2, 
  Link as LinkIcon, 
  FileText, 
  Code2, 
  FileCode,
  Calendar,
  Network,
  Layers,
  Search,
  LayoutGrid,
  Home
} from 'lucide-react'
import './App.css'

function App() {
  const {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    toggleFavorite,
    searchItems,
    loadItems,
  } = useKnowledge()
  
  const { accentColor, getCardDensityClasses } = useSettings()
  const densityClasses = getCardDensityClasses()

  // Dark mode detection for background particles
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

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedView, setSelectedView] = useState('home')
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [detailItem, setDetailItem] = useState(null) // For bottom sheet detail view
  const [filterType, setFilterType] = useState(null)

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

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      loadItems()
    } else {
      // Debounce search
      const timeoutId = setTimeout(() => {
        searchItems(query)
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  const handleDelete = (item) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const filteredItems = filterType
    ? items.filter(item => item.item_type === filterType)
    : items

  // Transform items into hierarchical structure for radial tree
  const getGraphData = () => {
    if (!items || items.length === 0) return null

    // Group items by type
    const groupedByType = items.reduce((acc, item) => {
      const type = item.item_type || 'other'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(item)
      return acc
    }, {})

    // Create hierarchical structure
    const root = {
      name: 'Knowledge Base',
      children: Object.entries(groupedByType).map(([type, typeItems]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1) + 's',
        children: typeItems.map(item => ({
          name: truncateTitle(item.title, 30),
          value: item.id,
          data: item
        }))
      }))
    }

    return root
  }

  const filterButtons = selectedView === 'feed' ? [
    { id: null, label: 'All', icon: <Layers className="w-4 h-4" /> },
    { id: 'link', label: 'Links', icon: <LinkIcon className="w-4 h-4" /> },
    { id: 'note', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'code', label: 'Code', icon: <Code2 className="w-4 h-4" /> },
    { id: 'paper', label: 'Papers', icon: <FileCode className="w-4 h-4" /> }
  ] : []

  return (
    <div className="min-h-screen bg-background">
      {/* Top Center - Project Selector Pill */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <ProjectSelector />
      </div>

      {/* Top Left Navigation - Icon Buttons */}
      <div className="fixed top-6 left-6 z-50 flex flex-col gap-2">
        {/* Brain Logo Button */}
        <div className="group relative">
          <Button 
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg bg-black hover:bg-gray-800"
          >
            <BrainLogo className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Home Button */}
        <div className="group relative">
          <Button 
            size="icon"
            className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
              selectedView === 'home' 
                ? 'bg-black hover:bg-gray-800 text-white' 
                : 'bg-card hover:bg-muted text-foreground'
            }`}
            onClick={() => setSelectedView('home')}
          >
            <Home className="w-5 h-5" />
          </Button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
            Home
          </div>
        </div>

        {/* Feed Button */}
        <div className="group relative">
          <Button 
            size="icon"
            className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
              selectedView === 'feed' 
                ? 'bg-black hover:bg-gray-800 text-white' 
                : 'bg-card hover:bg-muted text-foreground'
            }`}
            onClick={() => setSelectedView('feed')}
          >
            <Layers className="w-5 h-5" />
          </Button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
            Feed
          </div>
        </div>

        {/* Timeline Button */}
        <div className="group relative">
          <Button 
            size="icon"
            className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
              selectedView === 'timeline' 
                ? 'bg-black hover:bg-gray-800 text-white' 
                : 'bg-card hover:bg-muted text-foreground'
            }`}
            onClick={() => setSelectedView('timeline')}
          >
            <Calendar className="w-5 h-5" />
          </Button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
            Timeline
          </div>
        </div>

        {/* Graph Button */}
        <div className="group relative">
          <Button 
            size="icon"
            className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
              selectedView === 'graph' 
                ? 'bg-black hover:bg-gray-800 text-white' 
                : 'bg-card hover:bg-muted text-foreground'
            }`}
            onClick={() => setSelectedView('graph')}
          >
            <Network className="w-5 h-5" />
          </Button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
            Graph
          </div>
        </div>

        {/* Pinboard Button - Hidden for now */}
        {/* <div className="group relative">
          <Button 
            size="icon"
            className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
              selectedView === 'pinboard' 
                ? 'bg-black hover:bg-gray-800 text-white' 
                : 'bg-card hover:bg-muted text-foreground'
            }`}
            onClick={() => setSelectedView('pinboard')}
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light">
            Pinboard
          </div>
        </div> */}
      </div>

      {/* Filter Pills Bar - Only show when feed is selected and a filter is active */}
      {selectedView === 'feed' && filterType !== null && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40">
          <div className="rounded-full p-1 flex gap-1 shadow-lg bg-accent-color">
            {filterButtons.map((filter) => (
              <button
                key={filter.id ?? 'all'}
                className={`px-4 py-2 rounded-full text-sm font-light transition-colors flex items-center gap-1.5 ${
                  filterType === filter.id
                    ? 'bg-card text-foreground'
                    : 'text-white hover:brightness-90'
                }`}
                onClick={() => setFilterType(filter.id)}
              >
                {filter.icon}
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Left Action Buttons */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        {/* Search Button */}
        <div className="group relative">
          <Button 
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={() => setSearchDialogOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Search
          </div>
        </div>

        {/* New Item Button */}
        <div className="group relative">
          <Button 
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={() => setNewDialogOpen(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            New Item
          </div>
        </div>

        {/* Settings Button */}
        <div className="group relative">
          <Button 
            size="icon"
            variant="secondary"
            className={`h-12 w-12 rounded-full shadow-lg ${
              selectedView === 'settings' 
                ? 'bg-black hover:bg-gray-800 text-white' 
                : ''
            }`}
            onClick={() => setSelectedView('settings')}
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Settings
          </div>
        </div>

        {/* Filter Button with Expandable Pills */}
        {selectedView === 'feed' && filterType === null && (
          <div className="group relative">
            <Button 
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg bg-accent-color hover:bg-accent-color"
              onClick={() => setFilterType('link')}
            >
              <Layers className="w-5 h-5" />
            </Button>
            {/* Filter Pills on Hover */}
            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-accent-color rounded-full p-1 flex gap-1 shadow-lg">
                {filterButtons.map((filter) => (
                  <button
                    key={filter.id ?? 'all'}
                    className="px-4 py-2 bg-card text-foreground rounded-full text-sm font-light hover:bg-muted transition-colors pointer-events-auto flex items-center gap-1.5"
                    onClick={() => setFilterType(filter.id)}
                  >
                    {filter.icon}
                    <span className="hidden sm:inline">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className={selectedView === 'graph' || selectedView === 'pinboard' ? '' : 'container mx-auto px-4 py-6 pl-24 pb-32 md:pl-4 md:pb-6'}>
        {/* Random Fact Header - Only show on feed/home view */}
        {selectedView === 'feed' && (
          <div className="max-w-7xl mx-auto mb-6" style={{ paddingTop: '35vh' }}>
            <h2 className="text-5xl font-light leading-snug">
              {(() => {
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
                  "The longest English word without a vowel is 'rhythms'",
                  "Cleopatra lived closer to the moon landing than to the construction of the Great Pyramid",
                  "There are more possible iterations of a game of chess than atoms in the known universe",
                  "The human body contains enough carbon to make 900 pencils",
                  "A mantis shrimp can punch with the force of a bullet",
                  "The world's oldest known living tree is over 5,000 years old",
                  "Your brain is more active when you're asleep than when watching TV",
                  "The fingerprints of koalas are virtually indistinguishable from humans"
                ]
                const randomFact = facts[Math.floor(Math.random() * facts.length)]
                return randomFact
              })()}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 font-light">
              {(() => {
                const today = new Date().toDateString()
                const todayItems = items.filter(item => 
                  new Date(item.created_at).toDateString() === today
                )
                return todayItems.length > 0 
                  ? `${todayItems.length} item${todayItems.length !== 1 ? 's' : ''} added today` 
                  : 'No items added today yet'
              })()}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-pulse">
              <p className="text-lg">Loading your knowledge...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              <p className="font-semibold">Error loading items</p>
              <p className="text-sm mt-1">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => loadItems()}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Home View - Dashboard with Frosted Cards */}
        {!loading && !error && selectedView === 'home' && (
          <HomeView 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Feed View - Grid of Tiles */}
        {!loading && !error && selectedView === 'feed' && (
          <>
            {/* Antigravity Background */}
            <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
              <Antigravity 
                count={200}
                color={isDarkMode ? '#4a4a4a' : '#d1d5db'}
                particleSize={1.5}
                autoAnimate={true}
                particleShape="sphere"
              />
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10" style={{ paddingTop: '35vh' }}>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">
                  {searchQuery ? 'No items found' : 'No items yet'}
                </p>
                <p className="text-sm mt-2">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Click "+ New" to add your first knowledge item'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {(() => {
                  // Group items by date
                  const itemsByDate = filteredItems.reduce((acc, item) => {
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
                  return Object.entries(itemsByDate).map(([date, items]) => (
                    <div key={date}>
                      {/* Date Header */}
                      <h3 className="text-lg font-light text-foreground mb-4 pb-2 border-b">
                        {date}
                      </h3>
                      
                      {/* Items Grid */}
                      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${densityClasses.grid}`}>
                        {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="group cursor-pointer"
                    onClick={() => setDetailItem(item)}
                  >
                    {/* Render link preview for link items, regular card for others */}
                    {item.item_type === 'link' ? (
                      <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border hover:shadow-lg transition-all hover:-translate-y-1">
                        {/* Action buttons for link items */}
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.item_type)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id) }}
                              title={item.is_favorite ? 'Unfavorite' : 'Favorite'}
                            >
                              <Star className={`w-3 h-3 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            {/* Project Pill */}
                            {item.project_id && (
                              <ProjectPill projectId={item.project_id} size="sm" />
                            )}
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
                              onClick={(e) => { e.stopPropagation(); handleEdit(item) }}
                              title="Edit"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); handleDelete(item) }}
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
                          <div className="flex flex-wrap gap-1.5 p-3 border-t border-border bg-muted/50">
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Card className={`hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col h-full ${densityClasses.card}`}>
                        <CardHeader className={densityClasses.cardHeader}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.item_type)}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id) }}
                                title={item.is_favorite ? 'Unfavorite' : 'Favorite'}
                              >
                                <Star className={`w-3 h-3 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              </Button>
                              {/* Project Pill */}
                              {item.project_id && (
                                <ProjectPill projectId={item.project_id} size="sm" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); handleEdit(item) }}
                                title="Edit"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); handleDelete(item) }}
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle 
                            className={`${densityClasses.title} font-normal leading-snug line-clamp-2`}
                            title={item.title}
                          >
                            {truncateTitle(item.title, 70)}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {new Date(item.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className={`flex-1 ${densityClasses.cardContent}`}>
                          <div className={`${densityClasses.text} line-clamp-4 mb-3`}>
                            <ContentPreview content={item.content} maxLength={150} />
                          </div>
                          
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-accent-color hover:underline flex items-center gap-1 truncate"
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
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{item.tags.length - 3}
                              </Badge>
                            )}
                          </CardFooter>
                        )}
                      </Card>
                    )}
                  </div>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>
          </>
        )}

        {/* Timeline View */}
        {!loading && !error && selectedView === 'timeline' && (
          <div className="max-w-7xl mx-auto">
            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <span className="text-4xl mb-4 block">⏰</span>
                <p className="text-lg">No timeline to display</p>
                <p className="text-sm mt-2">Add some knowledge items to see them in chronological order</p>
              </div>
            ) : (
              <Timeline
                items={filteredItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </div>
        )}

        {/* Graph View - Similarity Network (Full Bleed) */}
        {!loading && !error && selectedView === 'graph' && (
          <div className="fixed inset-0 bg-background">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <span className="text-4xl mb-4 block">🕸️</span>
                  <p className="text-lg">No items to visualize</p>
                  <p className="text-sm mt-2">Add some knowledge items to see them in the graph</p>
                </div>
              </div>
            ) : items.length < 2 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <span className="text-4xl mb-4 block">🕸️</span>
                  <p className="text-lg">Need more items to show connections</p>
                  <p className="text-sm mt-2">Add at least 2 items to see similarity connections</p>
                </div>
              </div>
            ) : (
              <SimilarityGraph 
                items={items} 
                width={window.innerWidth} 
                height={window.innerHeight} 
              />
            )}
          </div>
        )}

        {/* Pinboard View (Full Bleed) */}
        {!loading && !error && selectedView === 'pinboard' && (
          <div className="fixed inset-0 bg-muted">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <span className="text-4xl mb-4 block">📌</span>
                  <p className="text-lg">No items to pin</p>
                  <p className="text-sm mt-2">Add some knowledge items to organize them on your pinboard</p>
                </div>
              </div>
            ) : (
              <InfinitePinboard
                items={filteredItems}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
                width={window.innerWidth}
                height={window.innerHeight}
              />
            )}
          </div>
        )}

        {/* Settings View */}
        {selectedView === 'settings' && (
          <Settings items={items} onImport={loadItems} />
        )}
      </main>

      {/* Dialogs */}
      <NewItemDialog
        open={newDialogOpen}
        onOpenChange={setNewDialogOpen}
        onSubmit={createItem}
      />

      <EditItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={selectedItem}
        onSubmit={updateItem}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={selectedItem}
        onConfirm={deleteItem}
      />

      {/* Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Search Knowledge</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="search"
              placeholder="Search your knowledge..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
              autoFocus
            />
            {searchQuery && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} found
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery('')
                    loadItems()
                  }}
                >
                  Clear search
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Detail Bottom Sheet - Feed View */}
      {detailItem && (
        <ItemDetailSheet
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  )
}

export default App
