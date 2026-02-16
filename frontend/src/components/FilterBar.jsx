import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { Link, FileText, Code, File, Star, Brain } from 'lucide-react'

export default function FilterBar() {
  const { filters, setFilters, fetchItems } = useStore()

  const types = [
    { id: null, label: 'All', icon: FileText },
    { id: 'link', label: 'Links', icon: Link },
    { id: 'note', label: 'Notes', icon: FileText },
    { id: 'snippet', label: 'Snippets', icon: Code },
    { id: 'paper', label: 'Papers', icon: File },
    { id: 'skill', label: 'Skills', icon: Brain },
  ]

  const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'updated_at', label: 'Recently Updated' },
    { value: 'vote_count', label: 'Most Voted' },
    { value: 'title', label: 'Alphabetical' },
  ]

  const handleTypeChange = (type) => {
    setFilters({ item_type: type })
    fetchItems()
  }

  const handleSortChange = (e) => {
    setFilters({ sort_by: e.target.value })
    fetchItems()
  }

  const handleFavoriteToggle = () => {
    setFilters({ favorite_only: !filters.favorite_only })
    fetchItems()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border"
    >
      {/* Type Filters */}
      <div className="flex gap-2">
        {types.map((type) => {
          const Icon = type.icon
          const isActive = filters.item_type === type.id

          return (
            <Button
              key={type.id || 'all'}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTypeChange(type.id)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {type.label}
            </Button>
          )
        })}
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Sort */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Sort:</label>
        <select
          value={filters.sort_by}
          onChange={handleSortChange}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Favorites Only */}
      <Button
        variant={filters.favorite_only ? 'default' : 'outline'}
        size="sm"
        onClick={handleFavoriteToggle}
        className="gap-2"
      >
        <Star className="h-4 w-4" />
        Favorites Only
      </Button>
    </motion.div>
  )
}
