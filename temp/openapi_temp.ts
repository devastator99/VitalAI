// utils/togetherApi.ts

import { Id } from "~/convex/_generated/dataModel";
import Constants from "expo-constants";

// Get Together API key
const Together_api_key = Constants.expoConfig?.extra?.TOGETHER_API_KEY;

// Function to get response from Together API (non-streaming)
export async function fetchTogetherResponse(
  messages: any[],
  model: string = "mistralai/Mixtral-8x7B-Instruct-v0.1"
) {
  try {
    console.log(`Using Together API key: ${Together_api_key ? 'set' : 'not set'}`);
    console.log('Request body:', JSON.stringify({
      model: model,
      messages: messages.map(msg => ({
        role: msg.isAi ? "assistant" : "user",
        content: msg.content
      }))
    }, null, 2));

    const response = await fetch(
      "https://api.together.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Together_api_key}`,
        },
        body: JSON.stringify({
          model: model,
          messages: messages.map(msg => ({
            role: msg.isAi ? "assistant" : "user",
            content: msg.content
          }))
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Together API error1: Status ${response.status}, Body: ${errorBody}`
      );
      throw new Error(
        `Together API error1: Status ${response.status}, Body: ${errorBody}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      data: data.choices[0].message.content,
      error: null,
    };
  } catch (error: any) {
    console.error("Together API Error2:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to get response from AI",
    };
  }
}

export async function fetchTogetherStreamingResponse(
  messages: any[],
  onTextDelta: (text: string) => void,
  onStart: () => void,
  onComplete: () => void,
  onError: (error: string) => void,
  model: string = "mistralai/Mixtral-8x7B-Instruct-v0.1"
) {
  try {
    console.log(`Using Together API key: ${Together_api_key ? 'set' : 'not set'}`);
    console.log('Request body:', JSON.stringify({
      model: model,
      messages: messages.map(msg => ({
        role: msg.isAi ? "assistant" : "user",
        content: msg.content
      }))
    }, null, 2));

    // Prepare the messages for the API
    const formattedMessages: any[] = messages.map((msg) => ({
      role: msg.isAi ? "assistant" : "user",
      content: msg.content,
    }));

    // Create the streaming request
    const response = await fetch(
      "https://api.together.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Together_api_key}`,
          "X-Together-Streaming": "true",
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Together API error3: Status ${response.status}, Body: ${errorBody}`
      );
      throw new Error(
        `Together API error3: Status ${response.status}, Body: ${errorBody}`
      );
    }

    let accumulatedText = "";

    // Handle the streaming events
    if (!response.body) {
      throw new Error("Response body is null");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        const chunk = decoder.decode(value);
        if (chunk) {
          // Parse the chunk as JSON
          const jsonChunk = JSON.parse(chunk);
          if (
            jsonChunk.choices &&
            jsonChunk.choices[0] &&
            jsonChunk.choices[0].delta
          ) {
            const deltaText = jsonChunk.choices[0].delta.content;
            accumulatedText += deltaText;
            onTextDelta(accumulatedText);
          }
        }
      }
    }

    onComplete();
    return {
      success: true,
      data: accumulatedText,
      error: null,
    };
  } catch (error: any) {
    console.error("Together API Streaming Error:", error);
    onError(error.message || "Failed to get streaming response from AI");
    return {
      success: false,
      data: null,
      error: error.message || "Failed to get streaming response from AI",
    };
  }
}
