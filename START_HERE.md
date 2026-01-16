# 🧠 brian - START HERE

**Your personal knowledge base is ready!**

A beautiful monochrome React app with Reddit-style feed, Time Machine timeline, and knowledge graph visualization.

---

## 🚀 Quick Start (2 Commands)

### 1. Install Frontend Dependencies
```bash
cd /Users/spencermartin/brian/frontend
npm install
```

### 2. Start brian (Backend + Frontend)
```bash
cd /Users/spencermartin/brian
./start-brian.sh
```

**Then open:** http://localhost:3000

---

## 🎨 What You Get

### Beautiful Monochrome Design
- Pure black/white/gray aesthetic
- Smooth light/dark mode toggle
- Modern, minimalist interface
- Framer Motion animations throughout

### Complete Features
✅ **Feed View** - Reddit-style cards with voting and favorites  
✅ **Search** - Real-time full-text search (Cmd+K)  
✅ **Filters** - By type, sort, favorites  
✅ **CRUD** - Add, edit, delete items  
✅ **Tags** - Organize with tags  
✅ **Voting** - Upvote/downvote items  
✅ **Favorites** - Star important items  
✅ **Keyboard Shortcuts** - Cmd+K (search), Cmd+N (new)  
🚧 **Timeline View** - Coming soon  
🚧 **Graph View** - Coming soon  

### Tech Stack
- **Frontend**: React 19 + Vite + shadcn/ui + Tailwind + Framer Motion
- **Backend**: FastAPI + SQLite + FTS5
- **State**: Zustand
- **Icons**: Lucide React
- **Toasts**: Sonner

---

## 📁 Project Structure

```
brian/
├── frontend/              # React app (localhost:3000)
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── views/        # Feed, Timeline, Graph
│   │   ├── api/          # Backend client
│   │   └── store/        # State management
│   └── package.json
├── brian/                 # Python backend (port 8080)
│   ├── api/              # FastAPI routes
│   ├── database/         # SQLite + schema
│   └── models/           # Data models
├── start-brian.sh        # Startup script
└── REACT-SETUP.md        # Detailed setup guide
```

---

## 🎯 Next Steps

### 1. Test the App
- Create different types of items (links, notes, snippets, papers)
- Add tags to organize
- Vote on items
- Toggle favorites
- Search your knowledge
- Switch between light/dark mode

### 2. Customize the Theme
Edit `frontend/src/index.css` to adjust monochrome shades:
```css
:root {
  --background: 0 0% 100%;  /* Adjust lightness */
  --foreground: 0 0% 5%;    /* Adjust darkness */
}
```

### 3. Add Animations from react-bits-temp
Copy cool components from `/Users/spencermartin/react-bits-temp/src/`:
- Text animations (fuzzy, glitch, scramble)
- GSAP scroll effects
- Three.js 3D visualizations
- Particle effects

### 4. Build Timeline View
Replace placeholder in `frontend/src/views/TimelineView.jsx` with:
- Vertical timeline component
- Date navigation
- Scroll animations

### 5. Build Graph View
Replace placeholder in `frontend/src/views/GraphView.jsx` with:
- D3.js force-directed graph
- Interactive nodes and edges
- Zoom and pan

---

## 📚 Documentation

- **REACT-SETUP.md** - Detailed React setup guide
- **QUICKSTART.md** - Backend quickstart
- **frontend/README.md** - Frontend documentation
- **API Docs** - http://127.0.0.1:8080/docs (when backend is running)

---

## 🐛 Troubleshooting

### Can't install dependencies?
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Backend not connecting?
Make sure it's running:
```bash
cd /Users/spencermartin/brian
source venv/bin/activate
python -m brian.main
```

### Port already in use?
Change port in `frontend/vite.config.js`:
```js
server: { port: 3001 }
```

---

## 🎉 You're Ready!

Your beautiful monochrome knowledge base is set up and ready to use.

**Start building your second brain with brian!** 🧠✨

---

## 🔗 Quick Links

- Frontend: http://localhost:3000
- Backend: http://127.0.0.1:8080
- API Docs: http://127.0.0.1:8080/docs
- Database: ~/.brian/brian.db

---

**Questions?** Check the detailed guides in REACT-SETUP.md and frontend/README.md

**Built with ❤️ for your brain**
