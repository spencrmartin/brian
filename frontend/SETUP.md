# 🧠 brian React Frontend Setup

## Installation Commands

Run these commands in order:

### 1. Navigate to frontend directory
```bash
cd /Users/spencermartin/brian/frontend
```

### 2. Install dependencies
```bash
pnpm install
```

This will install:
- **React 19** - Latest React
- **shadcn/ui** - Beautiful component library
- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon library
- **Zustand** - State management
- **React Router** - Navigation
- **Sonner** - Toast notifications

### 3. Start development server
```bash
pnpm dev
```

The frontend will run at: **http://localhost:5173**

## What's Been Set Up

### ✅ Monochrome Theme
- Beautiful black, white, and gray color palette
- Dark mode support
- Smooth transitions
- Custom scrollbars
- Focus states

### ✅ Project Structure
```
frontend/
├── src/
│   ├── api/          # API client for backend
│   ├── components/
│   │   └── ui/       # shadcn/ui components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities (cn, formatDate, etc.)
│   ├── pages/        # Page components
│   ├── store/        # Zustand state management
│   └── index.css     # Monochrome theme styles
├── package.json      # Dependencies
└── tailwind.config.js # Tailwind + monochrome config
```

### ✅ State Management (Zustand)
- Items state
- Filters
- Stats
- UI state (modals, views)
- All API actions

### ✅ API Client
- Connected to FastAPI backend at `http://127.0.0.1:8080`
- All CRUD operations
- Search, timeline, graph endpoints

## Next Steps (After pnpm install)

I'll create:

1. **Main App Component** with routing
2. **Feed View** with animated cards
3. **Time Machine View** with timeline
4. **Graph View** with D3/Three.js
5. **Modal Component** for add/edit
6. **Navigation Bar** with search
7. **Stats Dashboard**

## Environment Variables

Create `.env` file if you need to change the API URL:

```env
VITE_API_URL=http://127.0.0.1:8080/api/v1
```

## Building for Production

```bash
pnpm build
```

This creates a `dist/` folder that can be served by FastAPI.

---

**Ready to install? Run the commands above!** 🚀
