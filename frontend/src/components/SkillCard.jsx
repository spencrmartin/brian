import { useStore } from '../store/useStore'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { Star, Edit, Trash2, ExternalLink, Package, FileCode, FileText, Image } from 'lucide-react'
import { truncateText, formatRelativeTime } from '../lib/utils'
import { toast } from 'sonner'
import ContentPreview from './ContentPreview'

export default function SkillCard({ item, index }) {
  const { openModal, toggleFavorite, deleteItem } = useStore()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this skill?')) {
      const success = await deleteItem(item.id)
      if (success) {
        toast.success('Skill deleted successfully')
      } else {
        toast.error('Failed to delete skill')
      }
    }
  }

  const handleFavorite = async () => {
    await toggleFavorite(item.id)
  }

  // Extract skill metadata
  const skillMeta = item.skill_metadata || {}
  const skillName = skillMeta.name || item.title
  const skillDescription = skillMeta.description || ''
  const bundledResources = skillMeta.bundled_resources || {}
  
  // Count resources
  const scriptCount = bundledResources.scripts?.length || 0
  const referenceCount = bundledResources.references?.length || 0
  const assetCount = bundledResources.assets?.length || 0
  const totalResources = scriptCount + referenceCount + assetCount

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full flex flex-col hover:shadow-xl transition-shadow cursor-pointer group border-pink-200 dark:border-pink-900">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">🧠</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-normal text-lg leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-medium">
                    Skill
                  </span>
                </div>
                {skillDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {skillDescription}
                  </p>
                )}
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
              View on GitHub
            </a>
          )}
        </CardHeader>

        <CardContent className="flex-1 pb-3">
          <div className="line-clamp-4">
            <ContentPreview content={item.content} maxLength={200} />
          </div>

          {/* Bundled Resources Summary */}
          {totalResources > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 p-2 bg-secondary/50 rounded-md">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                <span className="font-medium">{totalResources} resources:</span>
              </div>
              {scriptCount > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <FileCode className="h-3 w-3" />
                  <span>{scriptCount} script{scriptCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {referenceCount > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <FileText className="h-3 w-3" />
                  <span>{referenceCount} reference{referenceCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {assetCount > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Image className="h-3 w-3" />
                  <span>{assetCount} asset{assetCount !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

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
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>From Anthropic</span>
          </div>

          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(item.created_at)}
          </span>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
