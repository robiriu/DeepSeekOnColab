import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_TOKEN);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { input } = req.body;

    // Validate input
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ result: 'Invalid input provided.' });
    }

    try {
      const response = await hf.textGeneration({
        model: 'gpt2', // Replace with your preferred model
        inputs: input,
      });

      console.log('API Response:', response); // Log API response for debugging
      res.status(200).json({ result: response.generated_text });
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message || error);
      res.status(500).json({ result: 'An error occurred. Please try again.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
