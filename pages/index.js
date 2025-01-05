import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState({
    gpt2: '',
    gptNeo: '',
    falcon: '',
    llama: '',
    mistral: '',
  });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat when new results are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent empty messages

    setLoading(true);

    try {
      // Call the backend API for each model
      const modelResponses = await Promise.all([
        fetchModelResponse('gpt2', input),
        fetchModelResponse('gpt-neo', input),
        fetchModelResponse('falcon', input),
        fetchModelResponse('llama', input),
        fetchModelResponse('mistral', input),
      ]);

      // Update the results state
      setResults({
        gpt2: modelResponses[0],
        gptNeo: modelResponses[1],
        falcon: modelResponses[2],
        llama: modelResponses[3],
        mistral: modelResponses[4],
      });
    } catch (error) {
      console.error('Error:', error);
      setResults({
        gpt2: 'Error',
        gptNeo: 'Error',
        falcon: 'Error',
        llama: 'Error',
        mistral: 'Error',
      });
    } finally {
      setLoading(false);
      setInput(''); // Clear the input field
    }
  };

  const fetchModelResponse = async (model, input) => {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input }),
    });
    const data = await response.json();
    return data.result;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerText}>ForceX AI Chat</h1>
      </header>

      {/* Output Columns */}
      <div style={styles.columnsContainer}>
        <div style={styles.column}>
          <h3 style={styles.columnHeader}>GPT-2</h3>
          <div style={styles.output}>{results.gpt2}</div>
        </div>
        <div style={styles.column}>
          <h3 style={styles.columnHeader}>GPT-Neo</h3>
          <div style={styles.output}>{results.gptNeo}</div>
        </div>
        <div style={styles.column}>
          <h3 style={styles.columnHeader}>Falcon</h3>
          <div style={styles.output}>{results.falcon}</div>
        </div>
        <div style={styles.column}>
          <h3 style={styles.columnHeader}>LLaMA</h3>
          <div style={styles.output}>{results.llama}</div>
        </div>
        <div style={styles.column}>
          <h3 style={styles.columnHeader}>Mistral</h3>
          <div style={styles.output}>{results.mistral}</div>
        </div>
      </div>

      {/* Input Box */}
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
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    backgroundColor: '#202123',
    color: '#fff',
    padding: '16px',
    textAlign: 'center',
  },
  headerText: {
    margin: 0,
    fontSize: '24px',
  },
  columnsContainer: {
    display: 'flex',
    flex: 1,
    padding: '16px',
    gap: '16px',
    overflowX: 'auto',
    backgroundColor: '#fff',
  },
  column: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
  },
  columnHeader: {
    margin: 0,
    fontSize: '18px',
    textAlign: 'center',
    marginBottom: '12px',
  },
  output: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    overflowY: 'auto',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  inputContainer: {
    display: 'flex',
    padding: '16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e5e5',
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    marginRight: '8px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#202123',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};