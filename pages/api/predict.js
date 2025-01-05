export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { input } = req.body;
  
      try {
        // Call the Hugging Face API endpoint
        const backendResponse = await fetch('/api/huggingface', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        });
        const data = await backendResponse.json();
  
        res.status(200).json({ result: data.result });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ result: 'An error occurred. Please try again.' });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }