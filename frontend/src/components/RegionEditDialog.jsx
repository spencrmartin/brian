import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Loader2, 
  Check, 
  Sparkles, 
  Settings2, 
  Palette,
  Brain,
  Zap,
  BookOpen,
  Code2,
  Search,
  FileText,
  Info
} from 'lucide-react'

// Predefined color palette for regions
const REGION_COLORS = [
  '#8b5cf6', // violet
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#22c55e', // green
  '#eab308', // yellow
  '#f97316', // orange
  '#ef4444', // red
  '#ec4899', // pink
  '#a855f7', // purple
]

// Context strategy descriptions
const STRATEGY_INFO = {
  FULL: {
    name: 'Full Context',
    description: 'Returns all content from items. Best for comprehensive understanding.',
    icon: FileText,
  },
  DENSE_RETRIEVAL: {
    name: 'Dense Retrieval',
    description: 'Uses semantic similarity to find most relevant content. Great for code.',
    icon: Code2,
  },
  HIERARCHICAL: {
    name: 'Hierarchical',
    description: 'Organizes content by importance levels. Ideal for research.',
    icon: BookOpen,
  },
  RECENCY_WEIGHTED: {
    name: 'Recency Weighted',
    description: 'Prioritizes recent content. Perfect for quick lookups.',
    icon: Zap,
  },
  GRAPH_TRAVERSAL: {
    name: 'Graph Traversal',
    description: 'Explores connections between items. Best for creative work.',
    icon: Brain,
  },
}

// Profile template info
const TEMPLATE_INFO = {
  code_assistant: {
    name: 'Code Assistant',
    description: 'Optimized for programming help with precise, technical responses.',
    icon: Code2,
    color: '#3b82f6',
  },
  research_mode: {
    name: 'Research Mode',
    description: 'Deep exploration with comprehensive context and citations.',
    icon: Search,
    color: '#8b5cf6',
  },
  creative_writing: {
    name: 'Creative Writing',
    description: 'Explores connections for inspiration and creative output.',
    icon: Sparkles,
    color: '#ec4899',
  },
  quick_lookup: {
    name: 'Quick Lookup',
    description: 'Fast, concise answers prioritizing recent information.',
    icon: Zap,
    color: '#f59e0b',
  },
  documentation: {
    name: 'Documentation',
    description: 'Comprehensive coverage for technical documentation.',
    icon: FileText,
    color: '#10b981',
  },
}

/**
 * RegionEditDialog - Modal for editing region details and AI profile configuration
 */
export function RegionEditDialog({ 
  open, 
  onOpenChange, 
  region, 
  onSave,
  onProfileChange,
  items = []
}) {
  const [activeTab, setActiveTab] = useState('details')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  
  // Region details state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(REGION_COLORS[0])
  const [selectedItemIds, setSelectedItemIds] = useState([])
  
  // Profile state
  const [profiles, setProfiles] = useState([])
  const [templates, setTemplates] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [showCreateProfile, setShowCreateProfile] = useState(false)
  
  // New profile form state
  const [newProfileName, setNewProfileName] = useState('')
  const [newProfileStrategy, setNewProfileStrategy] = useState('DENSE_RETRIEVAL')
  const [newProfileTemperature, setNewProfileTemperature] = useState(0.7)
  const [newProfileMaxTokens, setNewProfileMaxTokens] = useState(2000)
  const [newProfileSystemPrompt, setNewProfileSystemPrompt] = useState('')

  // Load region data when dialog opens
  useEffect(() => {
    if (open && region) {
      setName(region.name || '')
      setDescription(region.description || '')
      setColor(region.color || REGION_COLORS[0])
      setSelectedItemIds(region.item_ids || [])
      setActiveTab('details')
      
      // Fetch profile data
      fetchProfiles()
      fetchTemplates()
      fetchRegionProfile()
    }
  }, [open, region])

  // Fetch all available profiles
  const fetchProfiles = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/profiles')
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.profiles || [])
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error)
    }
  }

  // Fetch profile templates
  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/profiles/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  // Fetch current region's profile
  const fetchRegionProfile = async () => {
    if (!region?.id) {
      setIsLoadingProfile(false)
      return
    }
    
    setIsLoadingProfile(true)
    try {
      const response = await fetch(`http://localhost:8080/api/v1/regions/${region.id}/profile`)
      if (response.ok) {
        const data = await response.json()
        // Only set profile if it actually exists
        if (data.profile && data.profile.id) {
          setCurrentProfile(data.profile)
          setSelectedProfileId(data.profile.id)
        } else {
          setCurrentProfile(null)
          setSelectedProfileId('')
        }
      } else {
        // 404 or other error means no profile assigned
        setCurrentProfile(null)
        setSelectedProfileId('')
      }
    } catch (error) {
      console.error('Failed to fetch region profile:', error)
      setCurrentProfile(null)
      setSelectedProfileId('')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Create profile from template
  const handleCreateFromTemplate = async (templateKey) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/profiles/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_key: templateKey,
          name: `${region.name} - ${TEMPLATE_INFO[templateKey]?.name || templateKey}`
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        await fetchProfiles()
        // API returns profile directly, not wrapped in { profile: ... }
        const profileId = data.id || data.profile?.id
        setSelectedProfileId(profileId)
        await assignProfile(profileId)
      }
    } catch (error) {
      console.error('Failed to create profile from template:', error)
    }
  }

  // Create custom profile
  const handleCreateCustomProfile = async () => {
    if (!newProfileName.trim()) return
    
    try {
      const response = await fetch('http://localhost:8080/api/v1/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfileName,
          context_strategy: newProfileStrategy.toLowerCase(),
          temperature: newProfileTemperature,
          max_context_items: newProfileMaxTokens,
          system_prompt: newProfileSystemPrompt || null
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        await fetchProfiles()
        // API returns profile directly, not wrapped in { profile: ... }
        const profileId = data.id || data.profile?.id
        setSelectedProfileId(profileId)
        await assignProfile(profileId)
        setShowCreateProfile(false)
        resetNewProfileForm()
      }
    } catch (error) {
      console.error('Failed to create custom profile:', error)
    }
  }

  // Assign profile to region
  const assignProfile = async (profileId) => {
    if (!region?.id) return
    
    try {
      const response = await fetch(`http://localhost:8080/api/v1/regions/${region.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId })
      })
      
      if (response.ok) {
        await fetchRegionProfile()
        // Notify parent that profile changed so it can update its cache
        if (onProfileChange) {
          onProfileChange(region.id)
        }
      }
    } catch (error) {
      console.error('Failed to assign profile:', error)
    }
  }

  // Remove profile from region
  const removeProfile = async () => {
    if (!region?.id) return
    
    try {
      const response = await fetch(`http://localhost:8080/api/v1/regions/${region.id}/profile`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setCurrentProfile(null)
        setSelectedProfileId('')
        // Notify parent that profile was removed
        if (onProfileChange) {
          onProfileChange(region.id)
        }
      }
    } catch (error) {
      console.error('Failed to remove profile:', error)
    }
  }

  // Reset new profile form
  const resetNewProfileForm = () => {
    setNewProfileName('')
    setNewProfileStrategy('DENSE_RETRIEVAL')
    setNewProfileTemperature(0.7)
    setNewProfileMaxTokens(2000)
    setNewProfileSystemPrompt('')
  }

  // Toggle item selection
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }, [])

  // Save region changes
  const handleSave = async () => {
    if (!name.trim()) return
    
    setIsSaving(true)
    try {
      await onSave({
        id: region.id,
        name: name.trim(),
        description: description.trim(),
        color,
        item_ids: selectedItemIds
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save region:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!region) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            Edit Region
          </DialogTitle>
          <DialogDescription>
            Configure region details and AI behavior settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="gap-2">
              <Palette className="w-4 h-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <FileText className="w-4 h-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Profile
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 overflow-y-auto space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="region-name">Name</Label>
              <Input
                id="region-name"
                placeholder="Region name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region-description">Description</Label>
              <Input
                id="region-description"
                placeholder="What this region contains..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {REGION_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full transition-all
                      ${color === c 
                        ? 'ring-2 ring-offset-2 ring-offset-background scale-110' 
                        : 'hover:scale-110'
                      }
                    `}
                    style={{ backgroundColor: c, ringColor: c }}
                    onClick={() => setColor(c)}
                  >
                    {color === c && (
                      <Check className="w-4 h-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>{selectedItemIds.length} items selected</Label>
            </div>
            
            <div className="border rounded-lg flex-1 overflow-y-auto">
              {items.length > 0 ? (
                <div className="divide-y">
                  {items.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`
                          w-full px-3 py-2 text-left flex items-center gap-3 transition-colors
                          ${isSelected ? 'bg-primary/10' : 'hover:bg-muted'}
                        `}
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                          ${isSelected 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground/30'
                          }
                        `}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.item_type}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No items available
                </div>
              )}
            </div>
          </TabsContent>

          {/* AI Profile Tab */}
          <TabsContent value="profile" className="flex-1 overflow-y-auto space-y-4 mt-4">
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Current Profile Display */}
                {currentProfile && (
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        <span className="font-medium">{currentProfile.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={removeProfile}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    {/* Profile Stats */}
                    <div className="flex flex-wrap gap-2">
                      {/* Strategy Badge */}
                      {currentProfile.context_strategy && (
                        <Badge variant="secondary" className="gap-1.5">
                          {(() => {
                            const strategyKey = currentProfile.context_strategy.toUpperCase()
                            const StrategyIcon = STRATEGY_INFO[strategyKey]?.icon || Brain
                            return <StrategyIcon className="w-3 h-3" />
                          })()}
                          {STRATEGY_INFO[currentProfile.context_strategy.toUpperCase()]?.name || currentProfile.context_strategy}
                        </Badge>
                      )}
                      
                      {/* Temperature Badge */}
                      {currentProfile.temperature !== undefined && (
                        <Badge variant="outline" className="gap-1">
                          <span className="text-muted-foreground">Temp:</span>
                          {currentProfile.temperature}
                        </Badge>
                      )}
                      
                      {/* Max Context Items Badge */}
                      {currentProfile.max_context_items && (
                        <Badge variant="outline" className="gap-1">
                          <span className="text-muted-foreground">Max Items:</span>
                          {currentProfile.max_context_items}
                        </Badge>
                      )}
                    </div>
                    
                    {/* System Prompt Preview */}
                    {currentProfile.system_prompt && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1">System Prompt:</p>
                        <p className="text-xs line-clamp-2">{currentProfile.system_prompt}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Templates */}
                {!currentProfile && !showCreateProfile && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Quick Start Templates
                    </Label>
                    <div className="grid grid-cols-1 gap-2 relative z-10">
                      {Object.entries(TEMPLATE_INFO).map(([key, info]) => {
                        const Icon = info.icon
                        return (
                          <button
                            key={key}
                            type="button"
                            className="p-3 rounded-lg border text-left hover:bg-muted transition-colors flex items-start gap-3 cursor-pointer relative z-10"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCreateFromTemplate(key)
                            }}
                          >
                            <div 
                              className="p-2 rounded-lg pointer-events-none"
                              style={{ backgroundColor: `${info.color}20` }}
                            >
                              <Icon className="w-4 h-4 pointer-events-none" style={{ color: info.color }} />
                            </div>
                            <div className="flex-1 pointer-events-none">
                              <p className="font-medium text-sm">{info.name}</p>
                              <p className="text-xs text-muted-foreground">{info.description}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    
                    <div className="relative pointer-events-none">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => setShowCreateProfile(true)}
                    >
                      <Settings2 className="w-4 h-4" />
                      Create Custom Profile
                    </Button>
                  </div>
                )}

                {/* Existing Profile Selection */}
                {!currentProfile && profiles.length > 0 && !showCreateProfile && (
                  <div className="space-y-2">
                    <Label>Or Select Existing Profile</Label>
                    <Select value={selectedProfileId} onValueChange={(id) => {
                      setSelectedProfileId(id)
                      assignProfile(id)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a profile..." />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Custom Profile Form */}
                {showCreateProfile && (
                  <div className="space-y-4 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Custom Profile</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setShowCreateProfile(false)
                          resetNewProfileForm()
                        }}
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Profile Name</Label>
                      <Input
                        id="profile-name"
                        placeholder="My Custom Profile"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Context Strategy</Label>
                      <Select value={newProfileStrategy} onValueChange={setNewProfileStrategy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STRATEGY_INFO).map(([key, info]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <info.icon className="w-4 h-4" />
                                {info.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {STRATEGY_INFO[newProfileStrategy]?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Temperature ({newProfileTemperature})</Label>
                        <input
                          type="range"
                          id="temperature"
                          min="0"
                          max="1"
                          step="0.1"
                          value={newProfileTemperature}
                          onChange={(e) => setNewProfileTemperature(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Lower = more focused, Higher = more creative
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max-tokens">Max Tokens</Label>
                        <Input
                          id="max-tokens"
                          type="number"
                          min="100"
                          max="8000"
                          value={newProfileMaxTokens}
                          onChange={(e) => setNewProfileMaxTokens(parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="system-prompt">System Prompt (Optional)</Label>
                      <textarea
                        id="system-prompt"
                        className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background text-sm"
                        placeholder="Custom instructions for AI behavior..."
                        value={newProfileSystemPrompt}
                        onChange={(e) => setNewProfileSystemPrompt(e.target.value)}
                      />
                    </div>

                    <Button 
                      className="w-full"
                      onClick={handleCreateCustomProfile}
                      disabled={!newProfileName.trim()}
                    >
                      Create & Assign Profile
                    </Button>
                  </div>
                )}

                {/* Info Box */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    AI Profiles control how the assistant behaves when querying this region. 
                    Different strategies optimize for different use cases like coding, research, or creative work.
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            style={{ backgroundColor: color }}
            className="text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
