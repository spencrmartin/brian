import { useState } from 'react'
import { useKnowledge } from '@/hooks/useKnowledge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NewItemDialog } from '@/components/NewItemDialog'
import { EditItemDialog } from '@/components/EditItemDialog'
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog'
import { ProjectSelector } from '@/components/ProjectSelector'
import { SimilarityGraph } from '@/components/SimilarityGraph'
import { Settings } from '@/components/Settings'
import HomeView from '@/views/HomeView'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Settings as SettingsIcon, 
  Network,
  Search,
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

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedView, setSelectedView] = useState('home')
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      loadItems()
    } else {
      searchItems(query)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top Center - Project Selector Pill */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <ProjectSelector />
      </div>

      {/* Top Left Navigation - Icon Buttons */}
      <div className="fixed top-6 left-6 z-50 flex flex-col gap-2">
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
      </div>

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
      </div>

      {/* Main Content */}
      <main className={selectedView === 'graph' ? '' : 'container mx-auto px-4 py-6 pl-24 pb-32 md:pl-4 md:pb-6'}>
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
                  {items.length} result{items.length !== 1 ? 's' : ''} found
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
    </div>
  )
}

export default App
