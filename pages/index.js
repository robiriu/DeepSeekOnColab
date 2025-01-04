import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a backend API call with mock data
    setTimeout(() => {
      setResult(`You entered: ${input}`);
      setLoading(false);
    }, 1000); // Simulate a 1-second delay
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>DeepSeek Frontend</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Input:
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
            required
          />
        </label>
        <button
          type="submit"
          style={{ marginLeft: '10px', padding: '5px' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>Result:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}