import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectPill } from './ProjectPill'
import { Highlight, themes } from 'prism-react-renderer'
import MarkdownContent from './MarkdownContent'
import { 
  Link as LinkIcon, 
  FileText, 
  Code2, 
  FileCode,
  Star,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  X,
  Brain,
  Package,
  FileCode2,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

// Language display names for code snippets
const LANGUAGE_CONFIG = {
  javascript: { name: 'JavaScript', color: '#f7df1e', textColor: '#000' },
  typescript: { name: 'TypeScript', color: '#3178c6', textColor: '#fff' },
  python: { name: 'Python', color: '#3776ab', textColor: '#fff' },
  java: { name: 'Java', color: '#ed8b00', textColor: '#fff' },
  go: { name: 'Go', color: '#00add8', textColor: '#fff' },
  rust: { name: 'Rust', color: '#dea584', textColor: '#000' },
  sql: { name: 'SQL', color: '#e38c00', textColor: '#fff' },
  html: { name: 'HTML', color: '#e34f26', textColor: '#fff' },
  css: { name: 'CSS', color: '#1572b6', textColor: '#fff' },
  json: { name: 'JSON', color: '#292929', textColor: '#fff' },
  bash: { name: 'Bash', color: '#4eaa25', textColor: '#fff' },
  jsx: { name: 'JSX', color: '#61dafb', textColor: '#000' },
  tsx: { name: 'TSX', color: '#3178c6', textColor: '#fff' },
}

// Generate consistent colors for themes/tags
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

/**
 * ItemDetailSheet - Bottom sheet component for displaying item details
 * Used across Timeline, Feed, and Graph views for consistent item viewing experience
 */
export function ItemDetailSheet({ 
  item, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleFavorite 
}) {
  const [copied, setCopied] = useState(false)
  
  // Detect dark mode for code highlighting
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  const handleCopy = useCallback(async () => {
    if (!item?.content) return
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      toast.success('Content copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy content')
    }
  }, [item?.content])

  const handleDelete = () => {
    // Don't use confirm() — it's blocked in Tauri's webview.
    // App.jsx wires onDelete to open a DeleteConfirmDialog instead.
    onDelete?.(item)
    onClose()
  }

  if (!item) return null

  const isCodeItem = item.item_type === 'code' || item.item_type === 'snippet'
  const isLinkWithUrl = item.item_type === 'link' && item.url
  const isSkill = item.item_type === 'skill'
  const [iframeError, setIframeError] = useState(false)
  
  // Reset iframe error when item changes
  useEffect(() => {
    setIframeError(false)
  }, [item?.id])
  const language = (item.language || 'javascript').toLowerCase()
  const langConfig = LANGUAGE_CONFIG[language] || { 
    name: language.charAt(0).toUpperCase() + language.slice(1), 
    color: '#6b7280', 
    textColor: '#fff' 
  }
  
  // Extract skill metadata
  const skillMeta = item.skill_metadata || {}
  const bundledResources = skillMeta.bundled_resources || {}
  const scriptCount = bundledResources.scripts?.length || 0
  const referenceCount = bundledResources.references?.length || 0
  const assetCount = bundledResources.assets?.length || 0
  const totalResources = scriptCount + referenceCount + assetCount

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] lg:max-w-[75vw] z-50 animate-in slide-in-from-bottom duration-300">
        <div className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-background/95 via-background/90 to-background/85 rounded-t-3xl shadow-2xl border-t border-x border-border/50 max-h-[85vh] flex flex-col">
          {/* Frosted overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          {/* Handle bar */}
          <div className="relative flex justify-center pt-3 pb-2 flex-shrink-0">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>
          
          {/* Header */}
          <div className="relative flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10">
                {item.item_type === 'link' && <LinkIcon className="w-5 h-5" />}
                {item.item_type === 'note' && <FileText className="w-5 h-5" />}
                {(item.item_type === 'code' || item.item_type === 'snippet') && <Code2 className="w-5 h-5" />}
                {item.item_type === 'paper' && <FileCode className="w-5 h-5" />}
                {item.item_type === 'skill' && <Brain className="w-5 h-5 text-pink-500" />}
              </div>
              <span className="text-sm text-muted-foreground capitalize font-light">{item.item_type}</span>
              {isSkill && (
                <Badge className="bg-pink-500/10 text-pink-500 border-pink-500/20 font-light">
                  Anthropic Skill
                </Badge>
              )}
              {item.project_id && (
                <ProjectPill projectId={item.project_id} size="sm" />
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-accent/10"
                  onClick={() => onToggleFavorite(item.id)}
                  title={item.is_favorite ? 'Unfavorite' : 'Favorite'}
                >
                  <Star className={`w-4 h-4 ${item.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-accent/10"
                onClick={handleCopy}
                title="Copy content"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-accent/10"
                  onClick={() => {
                    onEdit(item)
                    onClose()
                  }}
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDelete}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-accent/10"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Content - Scrollable */}
          <div className="px-6 py-6 overflow-y-auto flex-1">
            {/* Title */}
            <h3 className="font-normal text-xl mb-4 leading-snug">
              {item.title}
            </h3>
            
            {/* Image items: show full-bleed image (base64 data URL stored in content) */}
            {item.item_type === 'image' && (item.url || item.content) && (
              <div className="mb-4 -mx-6 -mt-2">
                <img 
                  src={item.url || item.content}
                  alt={item.title}
                  className="w-full object-contain max-h-[60vh]"
                  loading="lazy"
                />
              </div>
            )}

            {/* Link items with URL: show iframe preview */}
            {isLinkWithUrl && !iframeError ? (
              <div className="mb-4">
                <div className="rounded-xl border border-border overflow-hidden bg-white" style={{ height: '400px' }}>
                  <iframe
                    src={item.url}
                    title={item.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    loading="lazy"
                    onError={() => setIframeError(true)}
                    onLoad={(e) => {
                      // Some sites block iframes — detect via empty content
                      try {
                        // Can't access cross-origin content, but if the load event fires
                        // without error, we assume it worked
                      } catch {
                        setIframeError(true)
                      }
                    }}
                  />
                </div>
                {/* Fallback content below iframe */}
                {item.content && item.content !== item.url && (
                  <div className="mt-4 text-muted-foreground">
                    <MarkdownContent content={item.content} />
                  </div>
                )}
              </div>
            ) : isCodeItem ? (
              <div className="mb-4">
                {/* Language Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span 
                    className="px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5"
                    style={{ 
                      backgroundColor: langConfig.color,
                      color: langConfig.textColor,
                    }}
                  >
                    <Code2 className="h-3 w-3" />
                    {langConfig.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.content?.split('\n').length || 0} lines
                  </span>
                </div>
                
                {/* Code Block */}
                <div 
                  className="rounded-lg border overflow-hidden"
                  style={{
                    backgroundColor: 'hsl(var(--code-bg))',
                    borderColor: 'hsl(var(--code-border))',
                  }}
                >
                  <Highlight
                    theme={isDark ? themes.vsDark : themes.vsLight}
                    code={item.content || ''}
                    language={language}
                  >
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                      <pre 
                        className="text-sm overflow-x-auto p-4 m-0"
                        style={{ 
                          ...style, 
                          backgroundColor: 'transparent',
                          fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
                        }}
                      >
                        <code className="block">
                          {tokens.map((line, i) => {
                            const lineProps = getLineProps({ line, key: i })
                            return (
                              <div key={i} {...lineProps} className="table-row">
                                <span 
                                  className="table-cell text-right pr-4 select-none"
                                  style={{ 
                                    color: 'hsl(var(--code-line-number))',
                                    minWidth: '2.5rem',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <span className="table-cell">
                                  {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token, key })} />
                                  ))}
                                </span>
                              </div>
                            )
                          })}
                        </code>
                      </pre>
                    )}
                  </Highlight>
                </div>
              </div>
            ) : (
              /* Regular Content with Markdown/Code Rendering */
              <div className="mb-4 text-muted-foreground">
                <MarkdownContent content={item.content} />
              </div>
            )}
            
            {/* Skill Metadata Section */}
            {isSkill && skillMeta && (
              <div className="mb-4 p-4 bg-pink-50 dark:bg-pink-950/30 rounded-lg border border-pink-200 dark:border-pink-900">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
                  <Brain className="w-4 h-4" />
                  Skill Information
                </h4>
                
                {skillMeta.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {skillMeta.description}
                  </p>
                )}
                
                {totalResources > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Package className="w-4 h-4" />
                      <span>Bundled Resources ({totalResources})</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 ml-6">
                      {scriptCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <FileCode2 className="w-3 h-3" />
                          <span>{scriptCount} script{scriptCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {referenceCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BookOpen className="w-3 h-3" />
                          <span>{referenceCount} reference{referenceCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {assetCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ImageIcon className="w-3 h-3" />
                          <span>{assetCount} asset{assetCount !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {skillMeta.license && (
                  <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-pink-200 dark:border-pink-900">
                    License: {skillMeta.license}
                  </p>
                )}
              </div>
            )}
            
            {/* URL (hide for image items since it's a data URL) */}
            {item.url && item.item_type !== 'image' && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-2 mb-4 p-3 bg-primary/10 rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.url}</span>
              </a>
            )}
            
            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, i) => (
                    <Badge 
                      key={i} 
                      variant="secondary" 
                      className="text-sm px-3 py-1.5"
                      style={{
                        backgroundColor: `${getThemeColor(tag)}20`,
                        borderColor: getThemeColor(tag),
                        color: getThemeColor(tag),
                        borderWidth: '1px'
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Metadata */}
            {item.created_at && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Created {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
