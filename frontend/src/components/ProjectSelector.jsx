import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog'
import { 
  Database, 
  Plus, 
  Check, 
  Search, 
  Archive,
  ChevronRight,
  Loader2,
  FolderOpen,
  Globe,
  Folder,
  Lightbulb,
  Rocket,
  BookOpen,
  Target,
  FlaskConical,
  Palette,
  Code,
  BarChart3,
  Brain,
  Heart,
  Star,
  Zap,
  Coffee,
  Music
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Icon mapping for projects - uses Lucide icon names
const ICON_MAP = {
  'globe': Globe,
  'folder': Folder,
  'database': Database,
  'lightbulb': Lightbulb,
  'rocket': Rocket,
  'book': BookOpen,
  'target': Target,
  'flask': FlaskConical,
  'palette': Palette,
  'code': Code,
  'chart': BarChart3,
  'brain': Brain,
  'heart': Heart,
  'star': Star,
  'zap': Zap,
  'coffee': Coffee,
  'music': Music,
}

// Get icon component from icon name
const getIconComponent = (iconName) => {
  if (!iconName) return Folder
  // Check if it's a Lucide icon name
  const Icon = ICON_MAP[iconName.toLowerCase()]
  if (Icon) return Icon
  // Fallback to Folder
  return Folder
}

// Check if icon is a Lucide icon (not emoji)
const isLucideIcon = (iconName) => {
  if (!iconName) return false
  return ICON_MAP.hasOwnProperty(iconName.toLowerCase())
}

export function ProjectSelector() {
  const {
    projects,
    currentProject,
    projectsLoading,
    fetchProjects,
    fetchCurrentProject,
    switchProject,
    createProject,
  } = useStore()

  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectColor, setNewProjectColor] = useState('#6366f1')
  const [newProjectIcon, setNewProjectIcon] = useState('folder')
  
  const panelRef = useRef(null)
  const buttonRef = useRef(null)

  // Load projects and current project on mount
  useEffect(() => {
    fetchProjects()
    fetchCurrentProject()
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard shortcut (Cmd+P)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'p') {
        event.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Filter projects based on search
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesArchived = showArchived || !project.is_archived
    return matchesSearch && matchesArchived
  })

  // Sort projects: current first, then by last_accessed_at
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.id === currentProject?.id) return -1
    if (b.id === currentProject?.id) return 1
    return new Date(b.last_accessed_at || 0) - new Date(a.last_accessed_at || 0)
  })

  const handleSwitchProject = async (projectId) => {
    if (projectId === currentProject?.id) {
      setIsOpen(false)
      return
    }
    await switchProject(projectId)
    setIsOpen(false)
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    
    const project = await createProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      color: newProjectColor,
      icon: newProjectIcon,
    })
    
    if (project) {
      setCreateDialogOpen(false)
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectColor('#6366f1')
      setNewProjectIcon('folder')
      // Optionally switch to the new project
      await switchProject(project.id)
    }
  }

  const colorOptions = [
    '#6366f1', // Indigo
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#3b82f6', // Blue
    '#6b7280', // Gray
  ]

  // Lucide icon options for projects
  const iconOptions = [
    { name: 'globe', Icon: Globe },
    { name: 'folder', Icon: Folder },
    { name: 'database', Icon: Database },
    { name: 'lightbulb', Icon: Lightbulb },
    { name: 'rocket', Icon: Rocket },
    { name: 'book', Icon: BookOpen },
    { name: 'target', Icon: Target },
    { name: 'flask', Icon: FlaskConical },
    { name: 'palette', Icon: Palette },
    { name: 'code', Icon: Code },
    { name: 'chart', Icon: BarChart3 },
    { name: 'brain', Icon: Brain },
    { name: 'heart', Icon: Heart },
    { name: 'star', Icon: Star },
    { name: 'zap', Icon: Zap },
    { name: 'coffee', Icon: Coffee },
  ]

  // Render project icon - handles both Lucide icons and legacy emojis
  const renderProjectIcon = (iconName, size = 'w-5 h-5') => {
    if (!iconName) {
      return <Folder className={size} />
    }
    // Check if it's a Lucide icon
    if (isLucideIcon(iconName)) {
      const IconComponent = getIconComponent(iconName)
      return <IconComponent className={size} />
    }
    // Fallback to emoji display for legacy data
    return <span className="text-base">{iconName}</span>
  }

  return (
    <>
      {/* Project Selector Button */}
      <div className="group relative" ref={buttonRef}>
        <Button 
          size="icon"
          className={`h-12 w-12 rounded-full shadow-lg transition-colors ${
            isOpen 
              ? 'bg-black hover:bg-gray-800 text-white' 
              : 'bg-card hover:bg-muted text-foreground'
          }`}
          onClick={() => setIsOpen(!isOpen)}
          style={currentProject?.color ? { 
            borderWidth: '2px',
            borderColor: currentProject.color,
          } : {}}
        >
          {renderProjectIcon(currentProject?.icon, 'w-5 h-5')}
        </Button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-light z-50">
          <div className="flex items-center gap-2">
            <span>{currentProject?.name || 'Knowledge Bases'}</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-white/20 rounded">⌘P</kbd>
          </div>
        </div>
      </div>

      {/* Project Selector Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-20 top-6 z-50 w-80 bg-card border rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Knowledge Bases</span>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Project List */}
            <div className="max-h-80 overflow-y-auto">
              {projectsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : sortedProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchQuery ? 'No projects found' : 'No projects yet'}
                </div>
              ) : (
                <div className="py-1">
                  {sortedProjects.map((project) => (
                    <button
                      key={project.id}
                      className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${
                        project.id === currentProject?.id ? 'bg-muted' : ''
                      } ${project.is_archived ? 'opacity-60' : ''}`}
                      onClick={() => handleSwitchProject(project.id)}
                    >
                      {/* Project Color Dot */}
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color || '#6366f1' }}
                      />
                      
                      {/* Project Icon */}
                      <span className="flex-shrink-0">
                        {renderProjectIcon(project.icon, 'w-4 h-4')}
                      </span>
                      
                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {project.name}
                          </span>
                          {project.is_default && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0">
                              Default
                            </Badge>
                          )}
                          {project.is_archived && (
                            <Archive className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{project.item_count || 0} items</span>
                          {project.region_count > 0 && (
                            <>
                              <span>•</span>
                              <span>{project.region_count} regions</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Current Indicator */}
                      {project.id === currentProject?.id && (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-2 border-t bg-muted/30">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start gap-2 text-sm"
                  onClick={() => {
                    setCreateDialogOpen(true)
                    setIsOpen(false)
                  }}
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs ${showArchived ? 'bg-muted' : ''}`}
                  onClick={() => {
                    setShowArchived(!showArchived)
                    fetchProjects(!showArchived)
                  }}
                >
                  <Archive className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Create New Project
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Icon & Color Selection */}
            <div className="flex items-center gap-4">
              {/* Icon Preview */}
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center border-2"
                style={{ borderColor: newProjectColor, backgroundColor: `${newProjectColor}20` }}
              >
                {renderProjectIcon(newProjectIcon, 'w-8 h-8')}
              </div>
              
              <div className="flex-1 space-y-2">
                {/* Icon Options */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
                  <div className="flex gap-1 flex-wrap">
                    {iconOptions.map(({ name, Icon }) => (
                      <button
                        key={name}
                        className={`w-7 h-7 rounded flex items-center justify-center hover:bg-muted transition-colors ${
                          newProjectIcon === name ? 'bg-muted ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setNewProjectIcon(name)}
                        title={name}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Color Options */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                  <div className="flex gap-1 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                          newProjectColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewProjectColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Name Input */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Project Name</label>
              <Input
                placeholder="My Knowledge Base"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
              />
            </div>
            
            {/* Description Input */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
              <Input
                placeholder="What is this project about?"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || projectsLoading}
            >
              {projectsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProjectSelector
