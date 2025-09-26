import React, { useState } from 'react'
import { 
  Settings, Phone, Database, Sun, Moon, 
  Play, Menu, Keyboard, Mic, Volume2, Clock,
  BookOpen, Cpu, Variable, Languages, FileText,
  CheckCircle, FunctionSquare, Shuffle, Power, ChevronDown, ChevronRight
} from 'lucide-react'

export default function Sidebar({ active, setActive, theme, setTheme }) {
  const [openCategory, setOpenCategory] = useState(null)
  const toggleCategory = (title) => setOpenCategory(openCategory === title ? null : title)

  const categories = [
    {
      title: '🔧 System',
      items: [
        { key: 'ivr-config', label: 'IVR Config', Icon: Settings },
        { key: 'dnis', label: 'DNIS', Icon: Phone },
        { key: 'fields-mapping', label: 'Fields Mapping', Icon: FileText },
        { key: 'language', label: 'Language', Icon: Languages },
        { key: 'setting', label: 'Setting', Icon: Settings },
        { key: 'variable', label: 'Variable', Icon: Variable },
      ]
    },
    {
      title: '🎭 Interactions',
      items: [
        { key: 'play', label: 'Play', Icon: Play },
        { key: 'menu', label: 'Menu', Icon: Menu },
        { key: 'input', label: 'Input', Icon: Keyboard },
        { key: 'dtmf', label: 'DTMF / DDTMF', Icon: Keyboard },
        { key: 'record', label: 'Record', Icon: Mic },
        { key: 'audio', label: 'Audio', Icon: Volume2 },
        { key: 'wait', label: 'Wait', Icon: Clock },
      ]
    },
    {
      title: '🗣 Voice',
      items: [
        { key: 'tts', label: 'TTS', Icon: Mic },
        { key: 'stt', label: 'STT', Icon: Mic },
        { key: 'istt', label: 'iSTT', Icon: Mic },
      ]
    },
    {
      title: '🗄 Data',
      items: [
        { key: 'db-node', label: 'DB Node (Fetch billing / payment)', Icon: Database },
      ]
    },
    {
      title: '🔀 Logic',
      items: [
        { key: 'function', label: 'Function', Icon: FunctionSquare },
        { key: 'if', label: 'If', Icon: Shuffle },
        { key: 'confirmation', label: 'Confirmation', Icon: CheckCircle },
      ]
    },
    {
      title: '📞 Call Control',
      items: [
        { key: 'transfer-call', label: 'Transfer_call', Icon: Phone },
        { key: 'terminator', label: 'Terminator', Icon: Power },
      ]
    }
  ]

  return (
    <aside className='rf-sidebar'>
      <div className='rf-sidebar-header'>
        <div className='rf-logo' />
        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Professional IVR</div>
          <h1 className='rf-title'>Flow Builder</h1>
        </div>
      </div>

      <div className='rf-sidebar-list'>
        {categories.map((cat) => (
          <div key={cat.title} style={{ marginBottom: 8 }}>
            <div 
              className="rf-category-header"
              onClick={() => toggleCategory(cat.title)}
            >
              <span>{cat.title}</span>
              {openCategory === cat.title ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
            </div>
            {openCategory === cat.title && (
              <div>
                {cat.items.map(({ key, label, Icon }) => (
                  <div 
                    key={key} 
                    className={'rf-sidebar-item ' + (active === key ? 'active' : '')} 
                    onClick={() => setActive(key)}
                  >
                    <Icon size={18} />
                    <div>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='rf-sidebar-bottom'>
        <button 
          className='theme-toggle-btn' 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>
    </aside>
  )
}
