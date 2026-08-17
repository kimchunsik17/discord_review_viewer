import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';

function App() {
  const [activeChannel, setActiveChannel] = useState('review-bot');

  return (
    <div className="app-container">
      <Sidebar activeChannel={activeChannel} setActiveChannel={setActiveChannel} />
      <ChatArea activeChannel={activeChannel} />
    </div>
  );
}

export default App;
