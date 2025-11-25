# IVR Flow Builder (Professional)

A professional React + Vite frontend with ReactFlow for building and managing IVR flows with **full data persistence**.

## ✨ Features

- **Dashboard**: Manage multiple IVR flows with create, edit, duplicate, delete operations
- **Flow Editor**: Visual flow builder with drag & drop nodes
  - Play, Menu, Collect, Decision, Transfer, TTS, STT, Set Variable, End nodes
  - ReactFlow canvas with MiniMap, Controls, Background
  - Custom node styling and configuration
- **IVR Configuration**: 5-step wizard for complete IVR setup
- **Auto-Save**: All data automatically persists to browser localStorage
- **No Data Loss**: Work safely - everything is saved instantly
- **Professional UI**: Modern navbar, sidebar, and responsive design

## 🚀 Quick Start

1. Navigate to the project folder
2. `npm install`
3. `npm run dev`
4. Open http://localhost:5173

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started immediately with the new features
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical overview of changes
- **[LOCALSTORAGE_GUIDE.md](./LOCALSTORAGE_GUIDE.md)** - Complete guide to data persistence
- **[DATA_FLOW_DIAGRAM.md](./DATA_FLOW_DIAGRAM.md)** - Visual architecture and data flow

## 💾 Data Persistence

All data is automatically saved to browser localStorage:

- ✅ Flow nodes and edges (per flow)
- ✅ Dashboard flows list
- ✅ IVR configuration settings
- ✅ No manual save needed
- ✅ Survives browser close/refresh

## 🎯 Usage

### Create a New Flow

1. Go to Dashboard
2. Click "New Flow"
3. Edit the flow to add nodes and connections
4. Everything saves automatically!

### Configure IVR Settings

1. Navigate to IVR Config
2. Fill in the 5-step wizard
3. Settings are saved as you type

### Manage Your Flows

- **Create**: New Flow button
- **Edit**: Click edit icon on any flow
- **Duplicate**: Copy flows instantly
- **Delete**: Remove with confirmation
- **Search**: Filter flows by name/description

## 🛠️ Tech Stack

- React 18
- Vite
- ReactFlow - Visual flow editor
- Material-UI (MUI) - IVR Config UI
- Lucide React - Icons
- localStorage - Data persistence

## 📦 Project Structure

```
src/
├── components/
│   ├── FlowEditor.jsx      # Main flow editor with auto-save
│   ├── CustomNode.jsx      # Custom node types
│   ├── NodeSidebar.jsx     # Node palette
│   ├── Toolbar.jsx         # Editor toolbar
│   └── Navbar.jsx          # Top navigation
├── pages/
│   ├── Dashboard.jsx       # Flow management dashboard
│   ├── Flowbuilder.jsx     # Flow builder page
│   └── IVRConfig.jsx       # IVR configuration wizard
├── hooks/
│   └── useLocalStorage.js  # localStorage utilities
├── App.jsx                 # Main app component
└── main.jsx               # Entry point
```

## 🔧 Development

### Add New Persistent Data

```javascript
import { useLocalStorage } from "./hooks/useLocalStorage";

function MyComponent() {
  const [data, setData] = useLocalStorage("myKey", defaultValue);
  // Use data and setData like normal React state
  // Auto-saves to localStorage!
}
```

### Clear All Data

```javascript
// In browser console
localStorage.clear();
location.reload();
```

## ⚠️ Notes

- Data is stored locally in the browser (not synced across devices)
- Storage limit: ~5-10 MB per domain
- Private/Incognito mode data is cleared when browser closes
- Export important flows as JSON for backup

## 🔮 Future Enhancements

- Cloud sync and backup
- Real-time collaboration
- Flow versioning and history
- Import/export all data
- Flow templates library
- Advanced analytics

## 📄 License

This is a frontend prototype. Integrate your STT/TTS and backend as needed.
