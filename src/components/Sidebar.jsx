import React from 'react';
import { Bot, Hash, BarChart3, Settings } from 'lucide-react';

const Sidebar = ({ activeChannel, setActiveChannel }) => {
  return (
    <div className="sidebar-wrapper">
      {/* Server List (Outer Sidebar) */}
      <div className="server-list">
        <div className="server-icon active" title="Review Bot Server">
          <Bot size={28} />
        </div>
        <div className="server-icon" style={{ backgroundColor: '#383a40' }} title="Add Server">
          <span style={{ fontSize: '24px', color: '#23a559' }}>+</span>
        </div>
      </div>

      {/* Channel List (Inner Sidebar) */}
      <div className="channel-list">
        <div className="channel-header">
          Review Bot Workspace
        </div>
        
        <div className="channel-content">
          <div 
            className={`channel-item ${activeChannel === 'review-bot' ? 'active' : ''}`}
            onClick={() => setActiveChannel('review-bot')}
          >
            <Hash size={20} />
            <span>review-bot</span>
          </div>
          <div 
            className={`channel-item ${activeChannel === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveChannel('dashboard')}
          >
            <BarChart3 size={20} />
            <span>dashboard</span>
          </div>
          <div 
            className={`channel-item ${activeChannel === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveChannel('settings')}
          >
            <Settings size={20} />
            <span>settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
