import React, { useState } from 'react';
import { Menu, X, Home, Workflow, FolderOpen } from 'lucide-react';

export default function FloatingHamburger({ onNavigate, currentPage, onOpenFlowsSidebar, isFlowsSidebarOpen }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (page) => {
    onNavigate(page);
    setIsOpen(false); // Close menu after navigation
  };

  const handleOpenFlows = () => {
    if (onOpenFlowsSidebar) {
      onOpenFlowsSidebar();
    }
    setIsOpen(false); // Close menu after opening flows
  };

  return (
    <div className="floating-hamburger-container">
      {/* Only show floating hamburger button if flows sidebar is not open */}
      {!isFlowsSidebarOpen && (
        <>
          {/* Floating hamburger button */}
          <button 
            className={`floating-hamburger-btn ${isOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            title="Navigation Menu"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="floating-hamburger-menu">
              <div className="floating-menu-header">
                <h3>Navigation</h3>
              </div>
              <div className="floating-menu-items">
                <button
                  className="floating-menu-item"
                  onClick={handleOpenFlows}
                >
                  <FolderOpen size={18} />
                  <span>Flow Manager</span>
                </button>
                <button
                  className={`floating-menu-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleNavigation('dashboard')}
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </button>
                <button
                  className={`floating-menu-item ${currentPage === 'flows' ? 'active' : ''}`}
                  onClick={() => handleNavigation('flows')}
                >
                  <Workflow size={18} />
                  <span>Flow Builder</span>
                </button>
              </div>
            </div>
          )}

          {/* Backdrop overlay */}
          {isOpen && (
            <div 
              className="floating-hamburger-backdrop"
              onClick={() => setIsOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}