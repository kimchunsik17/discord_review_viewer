import React, { useState, useEffect, useRef } from 'react';
import { Hash, PlusCircle } from 'lucide-react';
import MessageEmbed from './MessageEmbed';
import StatsDashboard from './StatsDashboard';
import { botLogic, processCommand } from '../services/botLogic';

const ChatArea = ({ activeChannel }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot-welcome',
      author: 'Review Bot',
      avatar: '🤖',
      timestamp: new Date().toISOString(),
      content: "안녕하세요! 저는 디스코드 리뷰 데이터 분석 봇입니다. 📊\n명령어를 입력해서 리뷰를 검색하거나 통계를 확인해보세요!\n\n**명령어 목록:**\n`/search <유저명>` - 특정 유저의 리뷰 검색\n`/stats <유저명>` - 특정 유저의 리뷰 통계 확인\n`/all` - 전체 리뷰 보기",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const userMessage = {
        id: Date.now(),
        type: 'user',
        author: 'dydeo', // Mock logged in user
        avatar: '👤',
        timestamp: new Date().toISOString(),
        content: inputValue
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Process bot response
      const botResponse = processCommand(inputValue);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot-response',
          author: 'Review Bot',
          avatar: '🤖',
          timestamp: new Date().toISOString(),
          ...botResponse
        }]);
      }, 500); // Simulate network delay

      setInputValue('');
    }
  };

  if (activeChannel === 'dashboard') {
    return (
      <div className="chat-area">
        <div className="chat-header">
          <Hash size={24} className="hash" />
          <span>dashboard</span>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <h2 style={{ color: 'var(--text-heading)', marginBottom: '16px' }}>전체 리뷰 통계 대시보드</h2>
          <StatsDashboard username="all" />
        </div>
      </div>
    );
  }

  if (activeChannel === 'settings') {
    return (
      <div className="chat-area">
        <div className="chat-header">
          <Hash size={24} className="hash" />
          <span>settings</span>
        </div>
        <div style={{ padding: '24px', flex: 1, color: 'var(--text-normal)' }}>
          준비 중인 채널입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Header */}
      <div className="chat-header">
        <Hash size={24} className="hash" />
        <span>review-bot</span>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className="message-item">
            <div className="avatar" style={{ backgroundColor: msg.author === 'Review Bot' ? 'var(--brand)' : '#313338' }}>
              {msg.avatar}
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="username">{msg.author}</span>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleString('ko-KR', {
                    year: 'numeric', month: '2-digit', day: '2-digit', 
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              
              {/* Normal text message */}
              {msg.content && (
                <div style={{ whiteSpace: 'pre-wrap', marginBottom: '4px' }}>
                  {msg.content}
                </div>
              )}

              {/* Bot Embeds (Reviews) */}
              {msg.embeds && msg.embeds.map((embed, idx) => (
                <MessageEmbed key={idx} embed={embed} />
              ))}

              {/* Bot Stats Dashboard */}
              {msg.statsFor && (
                <div style={{ marginTop: '16px', maxWidth: '600px' }}>
                  <StatsDashboard username={msg.statsFor} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-wrapper">
        <div className="chat-input">
          <PlusCircle size={24} color="var(--text-muted)" style={{ marginRight: '12px', cursor: 'pointer' }} />
          <input 
            type="text" 
            placeholder="#review-bot에 메시지 보내기" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
