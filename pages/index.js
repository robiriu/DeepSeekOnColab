import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState({});
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // LocalStorage keys
  const STORAGE_KEYS = {
    CONVERSATIONS: 'forcex_conversations',
    CHAT_SESSIONS: 'forcex_chat_sessions',
    CURRENT_CHAT_ID: 'forcex_current_chat_id',
    SIDEBAR_OPEN: 'forcex_sidebar_open'
  };

  // Save data to localStorage with error handling
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  // Load data from localStorage with error handling
  const loadFromStorage = (key, defaultValue = null) => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects for conversations
        if (key === STORAGE_KEYS.CONVERSATIONS && Array.isArray(parsed)) {
          return parsed.map(chat => ({
            ...chat,
            createdAt: new Date(chat.createdAt),
            lastMessage: chat.lastMessage ? new Date(chat.lastMessage) : null
          }));
        }
        // Convert date strings back to Date objects for chat sessions
        if (key === STORAGE_KEYS.CHAT_SESSIONS && typeof parsed === 'object') {
          const sessions = {};
          Object.keys(parsed).forEach(chatId => {
            sessions[chatId] = parsed[chatId].map(message => ({
              ...message,
              timestamp: new Date(message.timestamp)
            }));
          });
          return sessions;
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
    }
    return defaultValue;
  };

  // Load saved data on component mount
  useEffect(() => {
    const savedConversations = loadFromStorage(STORAGE_KEYS.CONVERSATIONS, []);
    const savedChatSessions = loadFromStorage(STORAGE_KEYS.CHAT_SESSIONS, {});
    const savedCurrentChatId = loadFromStorage(STORAGE_KEYS.CURRENT_CHAT_ID);
    const savedSidebarOpen = loadFromStorage(STORAGE_KEYS.SIDEBAR_OPEN, true);

    setConversations(savedConversations);
    setChatSessions(savedChatSessions);
    setSidebarOpen(savedSidebarOpen);

    // Set current chat ID if valid, otherwise create new chat
    if (savedCurrentChatId && savedConversations.find(chat => chat.id === savedCurrentChatId)) {
      setCurrentChatId(savedCurrentChatId);
    } else if (savedConversations.length > 0) {
      setCurrentChatId(savedConversations[0].id);
    } else {
      // Will create new chat in the next useEffect
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
  }, [conversations]);

  // Save chat sessions to localStorage whenever they change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CHAT_SESSIONS, chatSessions);
  }, [chatSessions]);

  // Save current chat ID to localStorage whenever it changes
  useEffect(() => {
    if (currentChatId) {
      saveToStorage(STORAGE_KEYS.CURRENT_CHAT_ID, currentChatId);
    }
  }, [currentChatId]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SIDEBAR_OPEN, sidebarOpen);
  }, [sidebarOpen]);

  // Get current conversation
  const currentConversation = currentChatId ? chatSessions[currentChatId] || [] : [];

  // Function to always focus the input field
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Function to scroll chat to the bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Automatically focus the input field and scroll to the bottom when the conversation updates
  useEffect(() => {
    focusInput();
    scrollToBottom();
  }, [currentConversation, loading]);

  // Create new chat session
  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      createdAt: new Date(),
      lastMessage: null
    };
    
    setConversations(prev => [newChat, ...prev]);
    setChatSessions(prev => ({ ...prev, [newChatId]: [] }));
    setCurrentChatId(newChatId);
  };

  // Switch to a different chat
  const switchToChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  // Update chat title based on first message
  const updateChatTitle = (chatId, firstMessage) => {
    const title = firstMessage.length > 40 ? firstMessage.substring(0, 40) + '...' : firstMessage;
    setConversations(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  };

  // Delete chat session
  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(chat => chat.id !== chatId);
    const updatedSessions = { ...chatSessions };
    delete updatedSessions[chatId];
    
    setConversations(updatedConversations);
    setChatSessions(updatedSessions);
    
    if (currentChatId === chatId) {
      if (updatedConversations.length > 0) {
        setCurrentChatId(updatedConversations[0].id);
      } else {
        // Will create new chat automatically
        setCurrentChatId(null);
      }
    }
  };

  // Initialize first chat on load
  useEffect(() => {
    if (conversations.length === 0 && !currentChatId) {
      createNewChat();
    }
  }, [conversations.length, currentChatId]);

  // Clean up old chats to prevent localStorage overflow (keep last 50 chats)
  useEffect(() => {
    if (conversations.length > 50) {
      const sortedConversations = [...conversations].sort((a, b) => 
        new Date(b.lastMessage || b.createdAt) - new Date(a.lastMessage || a.createdAt)
      );
      const keptConversations = sortedConversations.slice(0, 50);
      const removedChatIds = conversations
        .filter(chat => !keptConversations.find(kept => kept.id === chat.id))
        .map(chat => chat.id);
      
      // Remove old chat sessions
      const updatedSessions = { ...chatSessions };
      removedChatIds.forEach(chatId => {
        delete updatedSessions[chatId];
      });
      
      setConversations(keptConversations);
      setChatSessions(updatedSessions);
    }
  }, [conversations.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !currentChatId) return;

    const userMessage = input.trim();
    setInput('');

    // Create user message object
    const newMessage = { sender: 'User', message: userMessage, timestamp: new Date() };
    
    // Add user message to current chat session
    setChatSessions(prev => ({
      ...prev,
      [currentChatId]: [...(prev[currentChatId] || []), newMessage]
    }));

    // Update chat title if it's the first message
    const currentSession = chatSessions[currentChatId] || [];
    if (currentSession.length === 0) {
      updateChatTitle(currentChatId, userMessage);
    }

    // Update last message timestamp
    setConversations(prev => 
      prev.map(chat => 
        chat.id === currentChatId ? { ...chat, lastMessage: new Date() } : chat
      )
    );

    setLoading(true);

    try {
      // Try the primary API endpoint first (Groq Mixtral)
      let response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userMessage }),
      });

      let data = await response.json();

      // If primary API fails, try the alternative endpoint (Groq Llama)
      if (!response.ok || !data.result || data.result.includes('error')) {
        console.log('Primary API failed, trying alternative...');
        response = await fetch('/api/huggingface', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: userMessage }),
        });
        data = await response.json();
      }

      // Add AI response to current chat session (user message already added)
      const aiMessage = { 
        sender: 'AI', 
        message: data.result || 'I apologize, but I\'m having trouble responding right now. Please try again.',
        timestamp: new Date()
      };

      setChatSessions(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), aiMessage]
      }));

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { 
        sender: 'AI', 
        message: 'I\'m experiencing connection issues. Please check your internet connection and try again.',
        timestamp: new Date()
      };

      setChatSessions(prev => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), errorMessage]
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Sidebar */}
      <div style={{...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarClosed)}}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoSection}>
            <img src="/ForceX-logo.png" alt="ForceX" style={styles.sidebarLogo} />
            <h2 style={styles.sidebarTitle}>ForceX AI</h2>
          </div>
          <button style={styles.newChatButton} onClick={createNewChat}>
            <span style={styles.plusIcon}>+</span>
            New Chat
          </button>
        </div>

        <div style={styles.chatHistory}>
          <h3 style={styles.historyTitle}>Recent Chats</h3>
          {conversations.map((chat) => (
            <div
              key={chat.id}
              style={{
                ...styles.chatItem,
                ...(currentChatId === chat.id ? styles.chatItemActive : {})
              }}
              onClick={() => switchToChat(chat.id)}
            >
              <div style={styles.chatItemContent}>
                <div style={styles.chatItemTitle}>{chat.title}</div>
                <div style={styles.chatItemTime}>
                  {chat.lastMessage ? chat.lastMessage.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : 'Just now'}
                </div>
              </div>
              <button
                style={styles.deleteButton}
                onClick={(e) => deleteChat(chat.id, e)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div style={styles.sidebarFooter}>
          <a href="/" style={styles.homeLink}>
            <span style={styles.homeIcon}>🏠</span>
            Home
          </a>
          <a href="https://github.com/robiriu/DeepSeekOnColab" target="_blank" rel="noopener noreferrer" style={styles.githubLink}>
            <img src="/github-logo.png" alt="GitHub" style={styles.githubIcon} />
            GitHub
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div style={{...styles.mainContent, ...(sidebarOpen ? {} : styles.mainContentExpanded)}}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <button
              style={styles.sidebarToggle}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div style={styles.headerTitle}>
              {currentConversation.length > 0 ? 
                conversations.find(c => c.id === currentChatId)?.title || 'ForceX AI' 
                : 'ForceX AI'
              }
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main style={styles.main}>
          <div style={styles.chatWrapper}>
            <div ref={chatContainerRef} style={styles.chatContainer}>
              {currentConversation.length === 0 && (
                <div style={styles.welcomeContainer}>
                  <div style={styles.welcomeContent}>
                    <h2 style={styles.welcomeTitle}>Welcome to ForceX AI</h2>
                    <div style={styles.examplePrompts}>
                      <button
                        style={styles.exampleButton}
                        onClick={() => setInput("Explain quantum computing in simple terms")}
                      >
                        🔬 Explain quantum computing
                      </button>
                      <button
                        style={styles.exampleButton}
                        onClick={() => setInput("Write a Python function to find prime numbers")}
                      >
                        💻 Write Python code
                      </button>
                      <button
                        style={styles.exampleButton}
                        onClick={() => setInput("What are the latest trends in AI?")}
                      >
                        🤖 AI trends discussion
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentConversation.map((entry, index) => (
                <div
                  key={index}
                  style={entry.sender === 'User' ? styles.userMessageRow : styles.aiMessageRow}
                  className="fade-in"
                >
                  <div style={styles.messageContainer}>
                    <div style={styles.avatarContainer}>
                      {entry.sender === 'User' ? (
                        <div style={styles.userAvatar}>👤</div>
                      ) : (
                        <div style={styles.aiAvatar}>🤖</div>
                      )}
                    </div>
                    <div style={styles.messageContent}>
                      <div style={styles.messageHeader}>
                        <span style={styles.senderName}>{entry.sender}</span>
                        <span style={styles.timestamp}>
                          {entry.timestamp?.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div style={styles.messageText}>
                        {entry.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={styles.aiMessageRow} className="fade-in">
                  <div style={styles.messageContainer}>
                    <div style={styles.avatarContainer}>
                      <div style={styles.aiAvatar}>🤖</div>
                    </div>
                    <div style={styles.messageContent}>
                      <div style={styles.messageHeader}>
                        <span style={styles.senderName}>AI</span>
                      </div>
                      <div style={styles.loadingContainer}>
                        <div className="typing-indicator">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div style={styles.inputArea}>
            <div style={styles.inputWrapper}>
              <form onSubmit={handleSubmit} style={styles.inputForm}>
                <div style={styles.inputContainer}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message ForceX AI..."
                    style={styles.input}
                    disabled={loading}
                    rows={1}
                  />
                  <button 
                    type="submit" 
                    style={{
                      ...styles.sendButton,
                      ...(loading || !input.trim() ? styles.sendButtonDisabled : {})
                    }}
                    disabled={loading || !input.trim()}
                  >
                    ⬆️
                  </button>
                </div>
              </form>
              <p style={styles.disclaimer}>
                ForceX AI can make mistakes. Please verify important information.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#0f0f23',
    color: '#e1e1e6',
    display: 'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width: '300px',
    backgroundColor: '#16162a',
    borderRight: '1px solid #2d2d47',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    flexShrink: 0,
  },
  sidebarClosed: {
    width: '0px',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid #2d2d47',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  sidebarLogo: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
  },
  sidebarTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  newChatButton: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
  },
  plusIcon: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  chatHistory: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
  },
  historyTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chatItem: {
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'background-color 0.2s ease',
    backgroundColor: '#1e1e3f',
    border: '1px solid #404040',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatItemActive: {
    backgroundColor: '#4f46e5',
    border: '1px solid #5b52f7',
  },
  chatItemContent: {
    flex: 1,
    minWidth: 0,
  },
  chatItemTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e1e1e6',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chatItemTime: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  deleteButton: {
    width: '20px',
    height: '20px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    marginLeft: '8px',
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #2d2d47',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  homeLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#e1e1e6',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
    fontSize: '14px',
  },
  homeIcon: {
    fontSize: '16px',
  },
  githubLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#e1e1e6',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease',
    fontSize: '14px',
  },
  githubIcon: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    transition: 'margin-left 0.3s ease',
  },
  mainContentExpanded: {
    marginLeft: '0px',
  },
  header: {
    borderBottom: '1px solid #2d2d47',
    backgroundColor: '#16162a',
    padding: '16px 0',
    flexShrink: 0,
    zIndex: 10,
  },
  headerContent: {
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  sidebarToggle: {
    width: '40px',
    height: '40px',
    backgroundColor: 'transparent',
    border: '1px solid #404040',
    borderRadius: '8px',
    color: '#e1e1e6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  chatWrapper: {
    flex: 1,
    overflow: 'hidden',
    minHeight: 0,
  },
  chatContainer: {
    height: '100%',
    overflowY: 'auto',
    padding: '24px 0',
  },
  welcomeContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: '0 24px',
  },
  welcomeContent: {
    textAlign: 'center',
    maxWidth: '600px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '32px',
  },
  examplePrompts: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center',
  },
  exampleButton: {
    background: 'linear-gradient(135deg, #1e1e3f 0%, #2d2d47 100%)',
    border: '1px solid #404040',
    borderRadius: '12px',
    padding: '16px 24px',
    color: '#e1e1e6',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'left',
  },
  userMessageRow: {
    padding: '16px 24px',
    backgroundColor: 'transparent',
  },
  aiMessageRow: {
    padding: '16px 24px',
    backgroundColor: '#16162a',
  },
  messageContainer: {
    display: 'flex',
    maxWidth: '1000px',
    margin: '0 auto',
    gap: '16px',
  },
  avatarContainer: {
    flexShrink: 0,
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  aiAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#059669',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  messageContent: {
    flex: 1,
    minWidth: 0,
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  senderName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  },
  timestamp: {
    fontSize: '12px',
    color: '#6b7280',
  },
  messageText: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#e1e1e6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  loadingContainer: {
    padding: '8px 0',
  },
  inputArea: {
    borderTop: '1px solid #2d2d47',
    backgroundColor: '#0f0f23',
    padding: '24px',
    flexShrink: 0,
  },
  inputWrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  inputForm: {
    marginBottom: '12px',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#1e1e3f',
    borderRadius: '16px',
    border: '1px solid #404040',
    transition: 'border-color 0.2s ease',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    border: 'none',
    color: '#e1e1e6',
    fontSize: '16px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    maxHeight: '120px',
    minHeight: '24px',
  },
  sendButton: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#4f46e5',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    fontSize: '18px',
  },
  sendButtonDisabled: {
    backgroundColor: '#404040',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  disclaimer: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
    margin: 0,
  },
};