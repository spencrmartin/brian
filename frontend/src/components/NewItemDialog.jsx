import { useState } from 'react'
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

const ITEM_TYPES = [
  { value: 'link', label: '🔗 Link', icon: '🔗' },
  { value: 'note', label: '📝 Note', icon: '📝' },
  { value: 'code', label: '💻 Code', icon: '💻' },
  { value: 'paper', label: '📄 Paper', icon: '📄' },
]

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Knowledge</DialogTitle>
            <DialogDescription>
              Create a new item in your knowledge base. Add tags to organize it.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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

            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Enter the content, notes, or code..."
                className="min-h-[120px]"
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
                <Label htmlFor="language">Language (optional)</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  placeholder="e.g., javascript, python, rust..."
                />
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

          <DialogFooter>
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
