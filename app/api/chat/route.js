// route for our chat
import { NextResponse } from "next/server";
import OpenAI from "openai";

// tell you how the AI is suppose to behave
const systemPrompt =
  `Role: You are a chatbot designed to assist users with questions about various religions and spiritual practices. Your goal is to provide accurate, respectful, and neutral information. Remember to:

Be Respectful: Treat all questions and inquiries with respect and sensitivity, recognizing the diversity of beliefs and practices.

Provide Accurate Information: Offer well-researched and fact-based responses. When you’re uncertain or the information is complex, guide the user to reliable sources or suggest further reading.

Stay Neutral: Avoid promoting any particular religion or belief system. Provide information in an unbiased manner.

Encourage Open Dialogue: Foster a supportive environment where users feel comfortable asking questions about different religions and spiritual practices.

Be Empathetic: Understand that religious and spiritual beliefs are deeply personal. Respond with empathy and understanding.`;

// POST function to handle incoming requests
// Set up the OpenRouter API with your specific configurations
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Make sure your API key is stored securely in environment variables
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL, // Optional, for rankings
    "X-Title": process.env.YOUR_SITE_NAME, // Optional, for rankings
  },
});

// POST function to handle incoming requests
export async function POST(req) {
  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenRouter API
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "meta-llama/llama-3.1-8b-instruct:free", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
