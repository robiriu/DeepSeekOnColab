import React, { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user input to conversation
    const newConversation = [...conversation, { sender: 'User', message: input }];
    setConversation(newConversation);

    setLoading(true);

    try {
      // Fetch the response from the API
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();

      // Add the AI response to conversation
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
      </header>

      <div style={styles.chatContainer}>
        {conversation.map((entry, index) => (
          <div
            key={index}
            style={entry.sender === 'User' ? styles.userMessage : styles.aiMessage}
          >
            <strong>{entry.sender}:</strong> {entry.message}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={styles.inputContainer}>
        <input
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
  container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e2f', color: '#c9d1d9' },
  header: { textAlign: 'center', padding: '20px', backgroundColor: '#202123' },
  headerText: { fontSize: '28px', fontWeight: 'bold', color: '#58a6ff' },
  chatContainer: { flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#2e2e3d', borderRadius: '8px' },
  userMessage: { textAlign: 'right', marginBottom: '12px', color: '#58a6ff' },
  aiMessage: { textAlign: 'left', marginBottom: '12px', color: '#c9d1d9' },
  inputContainer: { display: 'flex', gap: '8px', padding: '16px', backgroundColor: '#202123', borderTop: '1px solid #444' },
  input: { flex: 1, padding: '12px', fontSize: '16px', borderRadius: '50px', border: '1px solid #444', backgroundColor: '#2e2e3d', color: '#ffffff' },
  button: { padding: '12px 24px', backgroundColor: '#58a6ff', color: '#ffffff', borderRadius: '50px', border: 'none', cursor: 'pointer' },
};
