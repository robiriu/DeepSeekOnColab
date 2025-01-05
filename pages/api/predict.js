import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_API_TOKEN);

// Use the Mistral 7B model
const model = 'mistralai/Mistral-7B-v0.1';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { input } = req.body;

    if (!input || input.trim().length === 0) {
      return res.status(400).json({ result: 'Input cannot be empty.' });
    }

    try {
      // Generate a response using Hugging Face API
      const response = await hf.textGeneration({
        model,
        inputs: input, // Send only the user's input
        parameters: {
          max_length: 100,         // Limit response length
          temperature: 0.7,        // Control randomness
          top_k: 50,               // Encourage diversity
          top_p: 0.9,              // Nucleus sampling
          repetition_penalty: 1.2, // Penalize repetition
        },
      });

      // Extract and clean the generated response
      const result = response.generated_text;

      // Post-process the output to remove unnecessary boilerplate text
      const cleanedResult = result.replace(/The user says:.*?Respond.*?:/gi, '').trim();

      // Return only the cleaned response
      res.status(200).json({ result: cleanedResult });
    } catch (error) {
      console.error('Error in API:', error.message || error);

      // Return an appropriate error message
      res.status(500).json({
        result: `An error occurred: ${error.message || 'Unknown error.'}`,
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
