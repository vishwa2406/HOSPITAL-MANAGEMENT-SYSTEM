import { GoogleGenerativeAI } from '@google/generative-ai';

export const handleChat = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback if API key is not configured
      return res.status(200).json({ 
        response: "I'm your AI health assistant. Note: Gemini API key is not configured in the backend environment, so I cannot process your request fully. Please ask the administrator to configure it." 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemContext = "You are a helpful and professional health assistant for Care Companion Hospital Management System. Provide general information but always remind the user that this is not a medical diagnosis and they should consult a doctor.";
    const fullPrompt = `${systemContext}\n\nUser: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    res.json({ response: responseText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ message: 'Failed to generate response from AI' });
  }
};
