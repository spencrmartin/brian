import { useStore } from '../store/useStore'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { Star, ArrowUp, ArrowDown, Edit, Trash2, ExternalLink } from 'lucide-react'
import { getItemTypeEmoji, truncateText, formatRelativeTime } from '../lib/utils'
import { toast } from 'sonner'
import CodeSnippetCard from './CodeSnippetCard'
import ContentPreview from './ContentPreview'

export default function KnowledgeCard({ item, index }) {
  // Use CodeSnippetCard for code/snippet types
  if (item.item_type === 'code' || item.item_type === 'snippet') {
    return <CodeSnippetCard item={item} index={index} />
  }
  const { openModal, toggleFavorite, voteItem, deleteItem } = useStore()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      const success = await deleteItem(item.id)
      if (success) {
        toast.success('Item deleted successfully')
      } else {
        toast.error('Failed to delete item')
      }
    }
  }

  const handleVote = async (direction) => {
    await voteItem(item.id, direction)
  }

  const handleFavorite = async () => {
    await toggleFavorite(item.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full flex flex-col hover:shadow-xl transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getItemTypeEmoji(item.item_type)}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
              </div>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleFavorite()
                }}
                className="h-8 w-8"
              >
                <Star
                  className={`h-4 w-4 ${
                    item.favorite ? 'fill-current text-yellow-500' : ''
                  }`}
                />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  openModal('edit', item)
                }}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="h-8 w-8 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
            >
              <ExternalLink className="h-3 w-3" />
              {new URL(item.url).hostname}
            </a>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <div className="line-clamp-4">
            <ContentPreview content={item.content} maxLength={200} />
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleVote('up')
              }}
              className="h-8 w-8"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium min-w-[2ch] text-center">
              {item.vote_count || 0}
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleVote('down')
              }}
              className="h-8 w-8"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(item.created_at)}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
