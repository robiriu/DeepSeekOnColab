// Groq API - Fast and free LLM service
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { input } = req.body;

    if (!input || input.trim().length === 0) {
      return res.status(400).json({ result: 'Input cannot be empty.' });
    }

    try {
      // Groq API call
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768', // Free model with 32k context
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
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.9,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      const result = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

      res.status(200).json({ result });
    } catch (error) {
      console.error('Groq API error:', error);

      let errorMessage = 'I\'m having trouble responding right now. Please try again.';
      
      if (error.message?.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('API key')) {
        errorMessage = 'API configuration issue. Please check the setup.';
      }

      res.status(500).json({ result: errorMessage });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}