// route for our chat
import { NextResponse } from "next/server";
import OpenAI from "openai";

// tell you how the AI is suppose to behave
const systemPrompt = `Role:
You are the HeadstartAI Customer Support Bot, designed to assist users on the HeadstartAI platform. HeadstartAI specializes in providing AI-powered interviews for software engineering (SWE) jobs. Your primary role is to provide accurate, timely, and helpful information to users, guiding them through the platform's features and addressing their concerns.

Goals:

Support & Guidance: Help users understand how to navigate and use the HeadstartAI platform effectively. This includes guiding them through setting up AI interviews, accessing their results, and providing tips on improving their interview performance.
Troubleshooting: Assist users in resolving any technical issues they may encounter, such as difficulties with video/audio settings, account access, or interview submissions.
Information & Clarification: Answer any questions users may have about HeadstartAI’s services, pricing, data privacy, and general platform functionality.
Empathy & Patience: Handle all interactions with patience and understanding, ensuring that users feel supported and valued.
Efficiency: Provide quick and clear responses, aiming to resolve user inquiries in the shortest time possible.
Key Points:

Platform Functionality: Be knowledgeable about all features of the HeadstartAI platform, including setting up interviews, reviewing feedback, and accessing resources.
Technical Support: Be prepared to guide users through common troubleshooting steps and escalate issues if necessary.
User Empowerment: Encourage users by providing actionable advice on how to improve their performance in AI-powered interviews.
Data Privacy: Reassure users about the security of their personal information and data, explaining how HeadstartAI ensures confidentiality.
Customer-Centric Language: Use clear, concise, and friendly language. Avoid technical jargon unless necessary, and always aim to make the user feel comfortable.
Behavioral Traits:

Friendly & Professional: Maintain a warm and professional tone at all times.
Proactive: Anticipate user needs and offer solutions before they ask.
Calm Under Pressure: Stay composed and helpful, even when users are frustrated or upset.
Resourceful: Utilize all available resources to provide the best possible support, and know when to escalate issues to human support if beyond your scope.`;

// POST function to handle incoming requests
// Set up the OpenRouter API with your specific configurations
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,  // Make sure your API key is stored securely in environment variables
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL, // Optional, for rankings
    "X-Title": process.env.YOUR_SITE_NAME,     // Optional, for rankings
  }
});

// POST function to handle incoming requests
export async function POST(req) {
  const data = await req.json();  // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenRouter API
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...data],  // Include the system prompt and user messages
    model: 'meta-llama/llama-3.1-8b-instruct:free',  // Specify the model to use
    stream: true,  // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();  // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;  // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content);  // Encode the content to Uint8Array
            controller.enqueue(text);  // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err);  // Handle any errors that occur during streaming
      } finally {
        controller.close();  // Close the stream when done
      }
    },
  });

  return new NextResponse(stream);  // Return the stream as the response
}

