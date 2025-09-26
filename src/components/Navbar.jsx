import React from 'react'
import { Bell, UserCircle, Search } from 'lucide-react'

export default function Navbar(){
  return (
    <div className='navbar'>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <div style={{fontWeight:700}}>Genesys-style IVR Designer</div>
        <div className='search-box'>
          <Search size={14} />
          <input placeholder='Search flows, nodes, interactions...' />
        </div>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <Bell size={18} />
        <UserCircle size={24} />
      </div>
    </div>
  )
}
