import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Sun, 
  Moon, 
  Monitor,
  Download,
  Upload,
  Trash2,
  Database,
  Palette,
  LayoutGrid,
  AlertTriangle
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

export function Settings({ items = [], onImport }) {
  const { 
    theme, 
    setTheme, 
    accentColor, 
    setAccentColor, 
    cardDensity, 
    setCardDensity 
  } = useSettings()
  
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const accentColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Yellow', value: '#eab308' },
  ]

  const handleExport = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      items: items
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brian-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setExportSuccess(true)
    setTimeout(() => setExportSuccess(false), 3000)
  }

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.items && Array.isArray(data.items)) {
          onImport?.(data.items)
          setImportDialogOpen(false)
        } else {
          alert('Invalid file format. Expected a Brian export file.')
        }
      } catch (err) {
        alert('Failed to parse file. Please ensure it\'s a valid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = async () => {
    // This would call the API to clear all data
    try {
      const response = await fetch('http://localhost:8080/api/v1/items/all', {
        method: 'DELETE'
      })
      if (response.ok) {
        setClearDialogOpen(false)
        window.location.reload()
      }
    } catch (err) {
      console.error('Failed to clear data:', err)
      alert('Failed to clear data. Please try again.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your Brian experience</p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Appearance</CardTitle>
                <CardDescription>Customize how Brian looks</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Theme</label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  System
                </Button>
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label className="text-sm font-medium mb-3 block">Accent Color</label>
              <div className="flex flex-wrap gap-2">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      accentColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Card Density */}
            <div>
              <label className="text-sm font-medium mb-3 block">Card Density</label>
              <div className="flex gap-2">
                <Button
                  variant={cardDensity === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCardDensity('compact')}
                >
                  Compact
                </Button>
                <Button
                  variant={cardDensity === 'comfortable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCardDensity('comfortable')}
                >
                  Comfortable
                </Button>
                <Button
                  variant={cardDensity === 'spacious' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCardDensity('spacious')}
                >
                  Spacious
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Data & Storage</CardTitle>
                <CardDescription>Manage your knowledge base data</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-2xl font-semibold">{items.length}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
              <div className="border-l pl-4">
                <p className="text-2xl font-semibold">
                  {items.reduce((acc, item) => acc + (item.tags?.length || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Tags</p>
              </div>
              <div className="border-l pl-4">
                <p className="text-2xl font-semibold">
                  {new Set(items.flatMap(item => item.tags || [])).size}
                </p>
                <p className="text-sm text-muted-foreground">Unique Tags</p>
              </div>
            </div>

            {/* Export */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Export Data</h4>
                <p className="text-sm text-muted-foreground">Download all your items as JSON</p>
              </div>
              <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {exportSuccess ? 'Exported!' : 'Export'}
              </Button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Import Data</h4>
                <p className="text-sm text-muted-foreground">Import items from a Brian export file</p>
              </div>
              <Button 
                onClick={() => setImportDialogOpen(true)} 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </div>

            {/* Clear Data */}
            <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
              <div>
                <h4 className="font-medium text-destructive">Clear All Data</h4>
                <p className="text-sm text-muted-foreground">Permanently delete all items</p>
              </div>
              <Button 
                onClick={() => setClearDialogOpen(true)} 
                variant="destructive" 
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Brian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Database:</strong> ~/.brian/brian.db</p>
              <p className="pt-2">
                Brian is your personal knowledge base for storing and connecting ideas, 
                links, notes, and code snippets.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Clear All Data
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete all {items.length} items 
              from your knowledge base.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearData}>
              Yes, delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>
              Select a Brian export file (.json) to import items into your knowledge base.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                cursor-pointer"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
