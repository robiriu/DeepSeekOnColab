import { HfInference } from '@huggingface/inference';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { input } = req.body;

    console.log('Input:', input); // Log the input
    console.log('HF API Token:', process.env.HF_API_TOKEN); // Log the token

    try {
      const hf = new HfInference(process.env.HF_API_TOKEN);
      const response = await hf.textGeneration({
        model: 'gpt2', // Replace with your preferred model
        inputs: `You are a helpful assistant. The user says: "${input}". Respond concisely:`,
        parameters: {
          max_length: 50, // Limit the response length
        },
      });

      console.log('API Response:', response); // Log the API response
      res.status(200).json({ result: response.generated_text });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ result: 'An error occurred. Please try again.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}