// Groq API backup with different model
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { input } = req.body;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({ result: 'Please provide a valid message.' });
    }

    try {
      // Groq API call with alternative model
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192', // Alternative Groq model that's definitely available
          messages: [
            {
              role: 'system',
              content: 'You are ForceX AI, a helpful and intelligent assistant. Provide clear, concise, and helpful responses.'
            },
            {
              role: 'user',
              content: input
            }
          ],
          max_tokens: 800,
          temperature: 0.8,
          top_p: 0.9,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API request failed');
      }

      const result = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

      res.status(200).json({ result });
    } catch (error) {
      console.error('Groq fallback API error:', error);

      let errorMessage = 'I apologize, but I\'m having trouble responding. Please try again.';
      
      if (error.message?.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('API key')) {
        errorMessage = 'API configuration issue. Please check your Groq API key.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      }

      res.status(500).json({ result: errorMessage });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}