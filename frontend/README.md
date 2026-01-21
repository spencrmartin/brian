# 🧠 brian - React Frontend

Beautiful, monochrome React frontend for brian knowledge base.

## 🎨 Design System

### Monochrome Theme
- **Light Mode**: Clean whites and grays
- **Dark Mode**: Deep blacks and subtle grays
- **Zero Color**: Pure monochrome aesthetic
- **Smooth Transitions**: All theme changes animated

### Tech Stack
- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool
- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - Simple state management
- **Lucide React** - Consistent icon system
- **Sonner** - Toast notifications

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
pnpm install
```

### 2. Start Development Server
```bash
pnpm dev
```

The app will run at **http://localhost:3000**

### 3. Make sure Backend is Running
```bash
# In another terminal
cd /Users/spencermartin/brian
source venv/bin/activate
python -m brian.main
```

Backend runs at **http://127.0.0.1:8080**

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API client for backend
│   │   └── client.js
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui base components
│   │   │   ├── button.jsx
│   │   │   └── card.jsx
│   │   ├── Navbar.jsx
│   │   ├── ViewSwitcher.jsx
│   │   ├── StatsBar.jsx
│   │   ├── FilterBar.jsx
│   │   ├── KnowledgeCard.jsx
│   │   └── ItemModal.jsx
│   ├── views/           # Main view components
│   │   ├── FeedView.jsx
│   │   ├── TimelineView.jsx
│   │   └── GraphView.jsx
│   ├── store/           # Zustand state management
│   │   └── useStore.js
│   ├── lib/             # Utilities
│   │   └── utils.js
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles + theme
├── components.json      # shadcn/ui config
├── tailwind.config.js   # Tailwind configuration
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies
```

## 🎯 Features

### ✅ Implemented
- **Monochrome Theme** - Light/dark mode with smooth transitions
- **Responsive Layout** - Works on all screen sizes
- **API Integration** - Connected to FastAPI backend
- **State Management** - Zustand store with all actions
- **Feed View** - Animated knowledge cards with CRUD operations
- **Search** - Real-time search with debouncing
- **Filters** - Type, sort, and favorites filtering
- **Modal** - Add/edit items with beautiful animations
- **Toast Notifications** - Success/error feedback
- **Keyboard Shortcuts** - Cmd+K for search, Cmd+N for new item

### 🚧 Coming Soon
- **Timeline View** - Scroll-based timeline with date navigation
- **Graph View** - Interactive knowledge graph with D3.js
- **Markdown Rendering** - Rich text display
- **Code Syntax Highlighting** - For code snippets
- **Drag & Drop** - Reorder and organize items
- **Export/Import** - Data portability

## 🎨 Component Library

### Base Components (shadcn/ui)
All components follow the monochrome theme and are fully accessible:

- `Button` - Multiple variants (default, outline, ghost, etc.)
- `Card` - Container with header, content, footer
- `Input` - Text inputs with validation
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Dialog` - Modal dialogs
- `Tabs` - Tabbed interfaces
- `Tooltip` - Hover information
- `Badge` - Labels and tags
- `Separator` - Visual dividers

### Custom Components
- `Navbar` - Top navigation with search and theme toggle
- `ViewSwitcher` - Animated view selection
- `StatsBar` - Dashboard statistics
- `FilterBar` - Content filtering
- `KnowledgeCard` - Individual knowledge item display
- `ItemModal` - Add/edit form

## 🎭 Animations

### Framer Motion
All animations use Framer Motion for smooth, performant transitions:

- **Page Transitions** - Fade in/out between views
- **Card Animations** - Staggered entrance, hover effects
- **Modal Animations** - Scale and fade
- **Layout Animations** - Smooth reordering
- **Gesture Animations** - Drag, swipe, etc.

### Animation Principles
- **Subtle** - Never distracting
- **Fast** - 200-300ms duration
- **Natural** - Spring physics
- **Purposeful** - Guides user attention

## 🎨 Styling Guide

### Monochrome Palette

#### Light Mode
```css
--background: 0 0% 100%      /* Pure white */
--foreground: 0 0% 5%        /* Near black */
--card: 0 0% 98%             /* Off white */
--primary: 0 0% 10%          /* Dark gray */
--secondary: 0 0% 94%        /* Light gray */
--muted: 0 0% 94%            /* Muted gray */
--border: 0 0% 90%           /* Border gray */
```

#### Dark Mode
```css
--background: 0 0% 5%        /* Near black */
--foreground: 0 0% 98%       /* Off white */
--card: 0 0% 8%              /* Dark card */
--primary: 0 0% 98%          /* Light gray */
--secondary: 0 0% 12%        /* Dark gray */
--muted: 0 0% 12%            /* Muted dark */
--border: 0 0% 15%           /* Border dark */
```

### Using the Theme
```jsx
// Tailwind classes automatically use theme variables
<div className="bg-background text-foreground">
  <Card className="bg-card border-border">
    <Button className="bg-primary text-primary-foreground">
      Click me
    </Button>
  </Card>
</div>
```

## 🔧 Development

### Adding New Components

#### From shadcn/ui
```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add tooltip
```

#### Custom Components
Create in `src/components/` and follow existing patterns:
- Use Framer Motion for animations
- Use Tailwind for styling
- Use Zustand store for state
- Follow monochrome theme

### State Management

```jsx
import { useStore } from './store/useStore'

function MyComponent() {
  const { items, fetchItems, createItem } = useStore()
  
  // Use store state and actions
}
```

### API Calls

```jsx
import { api } from './api/client'

// All API methods are available
const items = await api.getItems()
const item = await api.createItem(data)
```

## 🎯 Next Steps

1. **Run the app** - `pnpm install && pnpm dev`
2. **Test features** - Create, edit, delete items
3. **Customize theme** - Adjust colors in `index.css`
4. **Add components** - Build Timeline and Graph views
5. **Integrate react-bits** - Copy cool animations from react-bits-temp

## 📚 Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev/)

---

**Built with ❤️ for your brain 🧠**
