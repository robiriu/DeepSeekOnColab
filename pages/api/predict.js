import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_TOKEN);

const models = {
  gpt2: 'gpt2',
  'gpt-neo': 'EleutherAI/gpt-neo-1.3B',
  falcon: 'tiiuae/falcon-7b-instruct',
  llama: 'decapoda-research/llama-7b-hf',
  mistral: 'mistralai/Mistral-7B-v0.1',
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { model, input } = req.body;

    console.log('Model:', model); // Log the model
    console.log('Input:', input); // Log the input

    try {
      // Use the specified model for text generation
      const response = await hf.textGeneration({
        model: models[model],
        inputs: `You are a helpful AI assistant. The user says: "${input}". Respond helpfully:`,
        parameters: {
          max_length: 100,
          temperature: 0.7,
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