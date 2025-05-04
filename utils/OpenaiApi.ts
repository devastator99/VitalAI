// utils/openaiApi.ts

import { Id } from "~/convex/_generated/dataModel";
import OpenAI from "openai";
import Constants from "expo-constants";

// Initialize the OpenAI client
const OpenAI_api_key = Constants.expoConfig?.extra?.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OpenAI_api_key,
});

// Function to get response from OpenAI API (non-streaming)
export async function fetchOpenAIResponse(messages: any[], model: string = "gpt-4.1") {
  try {
    const response = await openai.responses.create({
      model: model,
      input: messages.map(msg => ({
        role: msg.isAi ? "assistant" : "user",
        content: msg.content
      }))
    });

    return {
      success: true,
      data: response.output_text,
      error: null
    };
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to get response from AI"
    };
  }
}

export async function fetchOpenAIStreamingResponse(
    messages: any[],
    onTextDelta: (text: string) => void,
    onStart: () => void,
    onComplete: () => void,
    onError: (error: string) => void,
    model: string = "gpt-4.1"
  ) {
    try {
      // Prepare the messages for the API
      const formattedMessages:any[] = messages.map(msg => ({
        role: msg.isAi ? "assistant" : "user",
        content: msg.content
      }));
  
      // Create the streaming request
      const stream = await openai.responses.create({
        model: model,
        input: formattedMessages,
        stream: true,
      });
  
      let accumulatedText = "";
  
      // Handle the streaming events
      for await (const event of stream) {
        // Check the event type and handle accordingly
        if (event.type === 'response.created') {
          onStart();
        } 
        else if (event.type === 'response.output_text.delta') {
          // This is the correct typing for text delta events
          if ('delta' in event && typeof event.delta === 'object' && event.delta && 'text' in event.delta) {
            const deltaText = (event.delta as { text?: string }).text || '';
            accumulatedText += deltaText;
            onTextDelta(accumulatedText);
          }
        }
        else if (event.type === 'response.completed') {
          onComplete();
        }
        else if (event.type === 'error') {
          const errorMessage = (event as any).error?.message || "Unknown streaming error";
          onError(errorMessage);
        }
      }
  
      return {
        success: true,
        data: accumulatedText,
        error: null
      };
    } catch (error: any) {
      console.error("OpenAI API Streaming Error:", error);
      onError(error.message || "Failed to get streaming response from AI");
      return {
        success: false,
        data: null,
        error: error.message || "Failed to get streaming response from AI"
      };
    }
  }