const asyncHandler = require('../utils/asyncHandler');
const Product = require('../models/Product');
const { GoogleGenAI } = require('@google/genai');

let ai;
try {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch (error) {
  console.warn("GoogleGenAI failed to initialize (Missing API Key?)", error.message);
}

// @desc    Chat with AI Assistant
// @route   POST /api/chat
// @access  Public
const chatWithAI = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      reply: "Hello! I am the Strandds AI Assistant. I am currently operating in offline mode because the administrator hasn't set up my API key yet. Please contact support or check back later!"
    });
  }

  // Fetch all products to use as context
  const products = await Product.find({}).select('name category type description price countInStock');
  
  const productContext = products.map(p => 
    `- **${p.name}** (Category: ${p.category}, Hair Type: ${p.type}) | Price: ₹${p.price} | Stock: ${p.countInStock > 0 ? 'In Stock' : 'Out of Stock'}\n  Description: ${p.description}`
  ).join('\n\n');

  const systemInstruction = `You are a professional, clinical, and helpful hair care expert working for "Strandds Ayurvedic Hair Cosmetics". 
Your tone should be elegant, slightly scientific, yet warm and accessible.
You help users diagnose their hair issues, build routines, and recommend products strictly from the Strandds catalog provided below.
Do not recommend products from other brands. 

Here is the live catalog of Strandds products you can recommend:
---
${productContext}
---

Always format your responses using clean Markdown. Use bold for product names. Keep responses concise but helpful.`;

  try {
    const contents = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add the user's current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    
    res.json({
      success: true,
      reply: response.text
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500);
    throw new Error('AI Assistant is currently unavailable. Please try again later.');
  }
});

module.exports = { chatWithAI };
