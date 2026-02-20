import { useState, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { Highlight, themes } from 'prism-react-renderer'
import { 
  Star, 
  Edit, 
  Trash2, 
  Copy, 
  Check,
  Code,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { formatRelativeTime } from '../lib/utils'
import { toast } from 'sonner'

// Language display names and colors
const LANGUAGE_CONFIG = {
  javascript: { name: 'JavaScript', color: '#f7df1e', textColor: '#000' },
  typescript: { name: 'TypeScript', color: '#3178c6', textColor: '#fff' },
  python: { name: 'Python', color: '#3776ab', textColor: '#fff' },
  java: { name: 'Java', color: '#ed8b00', textColor: '#fff' },
  csharp: { name: 'C#', color: '#239120', textColor: '#fff' },
  cpp: { name: 'C++', color: '#00599c', textColor: '#fff' },
  c: { name: 'C', color: '#a8b9cc', textColor: '#000' },
  go: { name: 'Go', color: '#00add8', textColor: '#fff' },
  rust: { name: 'Rust', color: '#dea584', textColor: '#000' },
  ruby: { name: 'Ruby', color: '#cc342d', textColor: '#fff' },
  php: { name: 'PHP', color: '#777bb4', textColor: '#fff' },
  swift: { name: 'Swift', color: '#fa7343', textColor: '#fff' },
  kotlin: { name: 'Kotlin', color: '#7f52ff', textColor: '#fff' },
  sql: { name: 'SQL', color: '#e38c00', textColor: '#fff' },
  html: { name: 'HTML', color: '#e34f26', textColor: '#fff' },
  css: { name: 'CSS', color: '#1572b6', textColor: '#fff' },
  scss: { name: 'SCSS', color: '#c6538c', textColor: '#fff' },
  json: { name: 'JSON', color: '#292929', textColor: '#fff' },
  yaml: { name: 'YAML', color: '#cb171e', textColor: '#fff' },
  markdown: { name: 'Markdown', color: '#083fa1', textColor: '#fff' },
  bash: { name: 'Bash', color: '#4eaa25', textColor: '#fff' },
  shell: { name: 'Shell', color: '#89e051', textColor: '#000' },
  jsx: { name: 'JSX', color: '#61dafb', textColor: '#000' },
  tsx: { name: 'TSX', color: '#3178c6', textColor: '#fff' },
}

// Map language aliases to prism language names
const LANGUAGE_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
}

const MAX_LINES_COLLAPSED = 8
const MAX_LINES_EXPANDED = 50

export default function CodeSnippetCard({ item, index }) {
  const { openModal, toggleFavorite, deleteItem } = useStore()
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  
  // Detect if we're in dark mode
  const isDark = document.documentElement.classList.contains('dark')

  // Normalize language
  const rawLanguage = (item.language || 'javascript').toLowerCase()
  const language = LANGUAGE_ALIASES[rawLanguage] || rawLanguage
  const langConfig = LANGUAGE_CONFIG[language] || { 
    name: language.charAt(0).toUpperCase() + language.slice(1), 
    color: '#6b7280', 
    textColor: '#fff' 
  }

  // Process code content
  const code = item.content || ''
  const lines = code.split('\n')
  const totalLines = lines.length
  const maxLines = expanded ? MAX_LINES_EXPANDED : MAX_LINES_COLLAPSED
  const needsTruncation = totalLines > MAX_LINES_COLLAPSED
  const displayCode = needsTruncation && !expanded 
    ? lines.slice(0, maxLines).join('\n')
    : lines.slice(0, MAX_LINES_EXPANDED).join('\n')

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy code')
    }
  }, [code])

  const handleDelete = async (e) => {
    e.stopPropagation()
    // confirm() is blocked in Tauri's webview — delete directly
    const success = await deleteItem(item.id)
    if (success) {
      toast.success('Snippet deleted successfully')
    } else {
      toast.error('Failed to delete snippet')
    }
  }

  const handleFavorite = async (e) => {
    e.stopPropagation()
    await toggleFavorite(item.id)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    openModal('edit', item)
  }

  const toggleExpand = (e) => {
    e.stopPropagation()
    setExpanded(!expanded)
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
      <Card 
        className="h-full flex flex-col hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
        style={{
          backgroundColor: 'hsl(var(--code-bg))',
          borderColor: 'hsl(var(--code-border))',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            backgroundColor: 'hsl(var(--code-header-bg))',
            borderColor: 'hsl(var(--code-border))',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Language Badge */}
            <span 
              className="px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5"
              style={{ 
                backgroundColor: langConfig.color,
                color: langConfig.textColor,
              }}
            >
              <Code className="h-3 w-3" />
              {langConfig.name}
            </span>
            
            {/* Title */}
            <h3 className="font-medium text-sm truncate max-w-[200px]">
              {item.title}
            </h3>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-7 w-7"
              title="Copy code"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              className="h-7 w-7"
              title="Favorite"
            >
              <Star
                className={`h-3.5 w-3.5 ${
                  item.favorite ? 'fill-current text-yellow-500' : ''
                }`}
              />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-7 w-7"
              title="Edit"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-7 w-7 hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-hidden">
          <Highlight
            theme={isDark ? themes.vsDark : themes.vsLight}
            code={displayCode}
            language={language}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre 
                className="text-sm overflow-x-auto p-0 m-0"
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
                      <div 
                        key={i} 
                        {...lineProps}
                        className="table-row"
                      >
                        {/* Line Number */}
                        <span 
                          className="table-cell text-right pr-4 pl-4 py-0.5 select-none"
                          style={{ 
                            color: 'hsl(var(--code-line-number))',
                            minWidth: '3rem',
                            fontSize: '0.75rem',
                          }}
                        >
                          {i + 1}
                        </span>
                        {/* Line Content */}
                        <span className="table-cell pr-4 py-0.5">
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

        {/* Expand/Collapse Button */}
        {needsTruncation && (
          <button
            onClick={toggleExpand}
            className="flex items-center justify-center gap-2 py-2 text-xs font-medium border-t transition-colors hover:bg-muted/50"
            style={{ borderColor: 'hsl(var(--code-border))' }}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show more ({totalLines - MAX_LINES_COLLAPSED} more lines)
              </>
            )}
          </button>
        )}

        {/* Footer */}
        <div 
          className="flex items-center justify-between px-4 py-2 border-t text-xs"
          style={{ borderColor: 'hsl(var(--code-border))' }}
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {item.tags && item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {item.tags && item.tags.length > 3 && (
              <span className="px-2 py-0.5 text-muted-foreground">
                +{item.tags.length - 3}
              </span>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>{totalLines} lines</span>
            <span>{formatRelativeTime(item.created_at)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
