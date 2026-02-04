import { useState, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Link as LinkIcon,
  Minus,
} from 'lucide-react'

const ITEM_TYPES = [
  { value: 'link', label: '🔗 Link', icon: '🔗' },
  { value: 'note', label: '📝 Note', icon: '📝' },
  { value: 'code', label: '💻 Code', icon: '💻' },
  { value: 'paper', label: '📄 Paper', icon: '📄' },
]

// Markdown formatting toolbar button
const ToolbarButton = ({ icon: Icon, label, onClick, shortcut }) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClick}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p>{label}</p>
        {shortcut && <p className="text-muted-foreground">{shortcut}</p>}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export function NewItemDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    item_type: 'note',
    url: '',
    language: '',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)

  // Insert markdown formatting at cursor position
  const insertMarkdown = useCallback((prefix, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const before = formData.content.substring(0, start)
    const after = formData.content.substring(end)
    
    const newContent = before + prefix + textToInsert + suffix + after
    setFormData(prev => ({ ...prev, content: newContent }))
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + prefix.length + textToInsert.length + suffix.length
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + textToInsert.length
      )
    }, 0)
  }, [formData.content])

  // Insert block-level markdown (headers, lists, etc.)
  const insertBlockMarkdown = useCallback((prefix) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const content = formData.content
    
    // Find the start of the current line
    let lineStart = start
    while (lineStart > 0 && content[lineStart - 1] !== '\n') {
      lineStart--
    }
    
    const before = content.substring(0, lineStart)
    const after = content.substring(lineStart)
    
    const newContent = before + prefix + after
    setFormData(prev => ({ ...prev, content: newContent }))
    
    setTimeout(() => {
      textarea.focus()
      const newPos = lineStart + prefix.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }, [formData.content])

  // Insert code block
  const insertCodeBlock = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    
    const before = formData.content.substring(0, start)
    const after = formData.content.substring(end)
    
    const codeBlock = selectedText 
      ? `\`\`\`\n${selectedText}\n\`\`\``
      : '```\n\n```'
    
    const newContent = before + codeBlock + after
    setFormData(prev => ({ ...prev, content: newContent }))
    
    setTimeout(() => {
      textarea.focus()
      // Position cursor inside the code block
      const cursorPos = start + 4 // After ```\n
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }, [formData.content])

  // Insert horizontal rule
  const insertHorizontalRule = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const content = formData.content
    
    const before = content.substring(0, start)
    const after = content.substring(start)
    
    // Add newlines if needed
    const needsNewlineBefore = before.length > 0 && !before.endsWith('\n')
    const rule = (needsNewlineBefore ? '\n' : '') + '\n---\n\n'
    
    const newContent = before + rule + after
    setFormData(prev => ({ ...prev, content: newContent }))
    
    setTimeout(() => {
      textarea.focus()
      const newPos = start + rule.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }, [formData.content])

  // Insert link
  const insertLink = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    
    const before = formData.content.substring(0, start)
    const after = formData.content.substring(end)
    
    const linkText = selectedText || 'link text'
    const newContent = before + `[${linkText}](url)` + after
    setFormData(prev => ({ ...prev, content: newContent }))
    
    setTimeout(() => {
      textarea.focus()
      // Select "url" for easy replacement
      const urlStart = start + linkText.length + 3
      const urlEnd = urlStart + 3
      textarea.setSelectionRange(urlStart, urlEnd)
    }, 0)
  }, [formData.content])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert tags string to array
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const data = {
        title: formData.title,
        content: formData.content,
        item_type: formData.item_type,
        tags,
      }

      // Add optional fields
      if (formData.url) data.url = formData.url
      if (formData.language) data.language = formData.language

      await onSubmit(data)

      // Reset form
      setFormData({
        title: '',
        content: '',
        item_type: 'note',
        url: '',
        language: '',
        tags: '',
      })
      onOpenChange(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          insertMarkdown('**', '**', 'bold text')
          break
        case 'i':
          e.preventDefault()
          insertMarkdown('*', '*', 'italic text')
          break
        case 'k':
          e.preventDefault()
          insertLink()
          break
        case '`':
          e.preventDefault()
          insertMarkdown('`', '`', 'code')
          break
      }
    }
  }, [insertMarkdown, insertLink])

  const isCodeType = formData.item_type === 'code'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Knowledge</DialogTitle>
            <DialogDescription>
              Create a new item in your knowledge base. Use markdown for formatting.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 flex-1 overflow-y-auto pr-2">
            {/* Top row: Type and Title side by side */}
            <div className="grid grid-cols-[180px_1fr] gap-4">
              {/* Item Type */}
              <div className="grid gap-2">
                <Label htmlFor="item_type">Type</Label>
                <Select
                  value={formData.item_type}
                  onValueChange={(value) => handleChange('item_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter a descriptive title..."
                  required
                />
              </div>
            </div>

            {/* Content with toolbar */}
            <div className="grid gap-2 flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content *</Label>
                {!isCodeType && (
                  <span className="text-xs text-muted-foreground">
                    Supports Markdown
                  </span>
                )}
              </div>
              
              {/* Markdown Toolbar - only show for non-code types */}
              {!isCodeType && (
                <div className="flex items-center gap-0.5 p-1 border rounded-md bg-muted/30 flex-wrap">
                  <ToolbarButton
                    icon={Heading1}
                    label="Heading 1"
                    onClick={() => insertBlockMarkdown('# ')}
                  />
                  <ToolbarButton
                    icon={Heading2}
                    label="Heading 2"
                    onClick={() => insertBlockMarkdown('## ')}
                  />
                  <ToolbarButton
                    icon={Heading3}
                    label="Heading 3"
                    onClick={() => insertBlockMarkdown('### ')}
                  />
                  
                  <div className="w-px h-6 bg-border mx-1" />
                  
                  <ToolbarButton
                    icon={Bold}
                    label="Bold"
                    shortcut="⌘B"
                    onClick={() => insertMarkdown('**', '**', 'bold text')}
                  />
                  <ToolbarButton
                    icon={Italic}
                    label="Italic"
                    shortcut="⌘I"
                    onClick={() => insertMarkdown('*', '*', 'italic text')}
                  />
                  <ToolbarButton
                    icon={Code}
                    label="Inline Code"
                    shortcut="⌘`"
                    onClick={() => insertMarkdown('`', '`', 'code')}
                  />
                  
                  <div className="w-px h-6 bg-border mx-1" />
                  
                  <ToolbarButton
                    icon={List}
                    label="Bullet List"
                    onClick={() => insertBlockMarkdown('- ')}
                  />
                  <ToolbarButton
                    icon={ListOrdered}
                    label="Numbered List"
                    onClick={() => insertBlockMarkdown('1. ')}
                  />
                  <ToolbarButton
                    icon={Quote}
                    label="Blockquote"
                    onClick={() => insertBlockMarkdown('> ')}
                  />
                  
                  <div className="w-px h-6 bg-border mx-1" />
                  
                  <ToolbarButton
                    icon={LinkIcon}
                    label="Link"
                    shortcut="⌘K"
                    onClick={insertLink}
                  />
                  <ToolbarButton
                    icon={Minus}
                    label="Horizontal Rule"
                    onClick={insertHorizontalRule}
                  />
                  
                  <div className="w-px h-6 bg-border mx-1" />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs font-mono"
                    onClick={insertCodeBlock}
                  >
                    {'```'}
                  </Button>
                </div>
              )}
              
              <Textarea
                ref={textareaRef}
                id="content"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isCodeType 
                  ? "Paste or write your code here..." 
                  : "Write your content here...\n\nUse the toolbar above or keyboard shortcuts:\n• ⌘B for bold\n• ⌘I for italic\n• ⌘K for links\n• ⌘` for inline code"
                }
                className={`min-h-[300px] resize-y ${isCodeType ? 'font-mono text-sm' : ''}`}
                required
              />
            </div>

            {/* URL (optional) */}
            {(formData.item_type === 'link' || formData.item_type === 'paper') && (
              <div className="grid gap-2">
                <Label htmlFor="url">URL {formData.item_type === 'link' ? '*' : '(optional)'}</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://example.com"
                  required={formData.item_type === 'link'}
                />
              </div>
            )}

            {/* Language (for code) */}
            {formData.item_type === 'code' && (
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="c">C</SelectItem>
                    <SelectItem value="csharp">C#</SelectItem>
                    <SelectItem value="ruby">Ruby</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="swift">Swift</SelectItem>
                    <SelectItem value="kotlin">Kotlin</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="css">CSS</SelectItem>
                    <SelectItem value="scss">SCSS</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="yaml">YAML</SelectItem>
                    <SelectItem value="bash">Bash/Shell</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="jsx">JSX</SelectItem>
                    <SelectItem value="tsx">TSX</SelectItem>
                    <SelectItem value="graphql">GraphQL</SelectItem>
                    <SelectItem value="dockerfile">Dockerfile</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="react, javascript, frontend (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
