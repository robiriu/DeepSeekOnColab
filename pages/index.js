import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null); // Ref for autoscrolling

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
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user input to conversation
    setConversation((prevConversation) => [
      ...prevConversation,
      { sender: 'User', message: input },
    ]);

    setLoading(true);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();

      // Add AI response to conversation
      setConversation((prevConversation) => [
        ...prevConversation,
        { sender: 'AI', message: data.result || 'Error generating response.' },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setConversation((prevConversation) => [
        ...prevConversation,
        { sender: 'AI', message: 'An error occurred while generating a response.' },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerText}>ForceX AI Chat</h1>
        <a
          href="https://github.com/robiriu/DeepSeekOnColab"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.githubLink}
        >
          <img
            src="/github-logo.png"
            alt="GitHub Logo"
            style={styles.githubLogo}
          />
        </a>
      </header>

      <div ref={chatContainerRef} style={styles.chatContainer}>
        {conversation.map((entry, index) => (
          <div
            key={index}
            style={
              entry.sender === 'User' ? styles.userMessageContainer : styles.aiMessageContainer
            }
          >
            <div
              style={entry.sender === 'User' ? styles.userMessage : styles.aiMessage}
            >
              <strong>{entry.sender}:</strong> {entry.message}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
          disabled={loading}
          required
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Generating...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f7f7f7',
    color: '#333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #ddd',
  },
  headerText: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  githubLink: {
    textDecoration: 'none',
  },
  githubLogo: {
    height: '32px',
    width: '32px',
  },
  chatContainer: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#ffffff',
  },
  userMessageContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#d1e7fd',
    color: '#333',
    padding: '10px 15px',
    borderRadius: '15px',
    maxWidth: '70%',
    wordWrap: 'break-word',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  aiMessage: {
    backgroundColor: '#f0f0f0',
    color: '#333',
    padding: '10px 15px',
    borderRadius: '15px',
    maxWidth: '70%',
    wordWrap: 'break-word',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #ddd',
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    borderRadius: '25px',
    border: '1px solid #ccc',
    backgroundColor: '#ffffff',
    color: '#333',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4a90e2',
    color: '#ffffff',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'background-color 0.3s ease',
  },
};
