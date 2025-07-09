// utils/togetherApi.ts

import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Message {
  content: string;
  isAi?: boolean;
}

interface CompletionRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

interface CompletionResponse {
  choices: Array<{
    text: string;
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface StreamChunk {
  choices: Array<{
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

// ─── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = "https://api.together.xyz/v1";
const DEFAULT_MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1";
const FETCH_TIMEOUT_MS = 30_000; // 30s

// ─── Helpers ───────────────────────────────────────────────────────────────────

// 1. Grab API key (env → secure store → error)
async function getApiKey(): Promise<string> {
  const envKey = Constants.expoConfig?.extra?.TOGETHER_API_KEY;
  if (envKey) return envKey;
  const stored = await SecureStore.getItemAsync("TOGETHER_API_KEY");
  if (stored) return stored;
  throw new Error("Together.ai API key not found");
}

// 2. Wrap fetch in an AbortController to enforce timeouts
function fetchWithTimeout(
  resource: string,
  options: RequestInit = {},
  timeout = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  return fetch(resource, { ...options, signal: controller.signal }).finally(
    () => clearTimeout(id)
  );
}

// 3. Core request builder
async function togetherFetch(
  endpoint: string,
  body: any,
  stream: boolean = false
): Promise<Response> {
  const key = await getApiKey();
  const url = `${BASE_URL}${endpoint}`;
  console.log(url, "url from together llm");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
  if (stream) headers["X-Together-Streaming"] = "true";

  const payloadString = JSON.stringify(body);
  if (__DEV__) console.log("Payload:", payloadString);

  return fetchWithTimeout(url, {
    method: "POST",
    headers,
    body: payloadString,
  });
}

// ─── Non-Streaming API ─────────────────────────────────────────────────────────

export async function fetchTogetherResponse(
  messages: Message[],
  model: string = DEFAULT_MODEL
): Promise<{
  success: boolean;
  data: string | null;
  error: string | null;
}> {
  try {
    // Start with a system message
    const formattedMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: 'You are a helpful AI assistant.' }
    ];

    // Process user/assistant messages if any exist
    if (messages && messages.length > 0) {
      let lastRole: 'user' | 'assistant' | null = null;
      
      for (const message of messages) {
        if (!message.content?.trim()) continue; // Skip empty messages
        
        const role = message.isAi ? 'assistant' : 'user';
        
        // Skip if we have the same role twice in a row
        if (role === lastRole) continue;
        
        // Add the message with proper role
        formattedMessages.push({
          role,
          content: message.content.trim()
        });
        
        lastRole = role;
      }

      // If we have user messages, ensure the last message is from the user
      if (lastRole === 'assistant' && formattedMessages.length > 1) {
        formattedMessages.pop();
      }
    }

    // If no valid user messages, add a default user message
    if (formattedMessages.length === 1) { // Only has system message
      formattedMessages.push({
        role: 'user',
        content: 'Hello!'
      });
    }

    const payload: ChatCompletionRequest = {
      model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
      stop: ['</s>', '<|im_end|>'],
    };

    console.log("Sending request to Together.ai:", JSON.stringify(payload, null, 2));
    
    const res = await togetherFetch("/chat/completions", payload, false);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Together.ai API error: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data: ChatCompletionResponse = await res.json();
    console.log("Received response from Together.ai:", data);

    if (!data.choices?.length) {
      throw new Error("No choices returned from Together.ai");
    }

    return {
      success: true,
      data: data.choices[0].message.content,
      error: null,
    };
  } catch (error: any) {
    console.error("Together API Error:", error);
    return {
      success: false,
      data: null,
      error: error.message || "Failed to fetch response",
    };
  }
}

// ─── Streaming API ────────────────────────────────────────────────────────────

export async function fetchTogetherStreamingResponse(
  messages: Message[],
  onTextDelta: (text: string) => void,
  onStart: () => void,
  onComplete: () => void,
  onError: (error: string) => void,
  model: string = DEFAULT_MODEL
): Promise<{
  success: boolean;
  data: string | null;
  error: string | null;
}> {
  try {
    // Format messages for Together API with streaming
    const formattedMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: 'You are a helpful AI assistant.' }
    ];

    // Process user/assistant messages, ensuring they alternate
    let lastRole: 'user' | 'assistant' | null = null;
    
    for (const message of messages) {
      const role = message.isAi ? 'assistant' : 'user';
      
      // Skip if we have the same role twice in a row
      if (role === lastRole) continue;
      
      // Add the message with proper role
      formattedMessages.push({
        role,
        content: message.content.trim()
      });
      
      lastRole = role;
    }

    // Ensure the last message is from the user
    if (formattedMessages.length > 0 && formattedMessages[formattedMessages.length - 1].role !== 'user') {
      formattedMessages.pop();
    }

    // Ensure we have at least one message
    if (formattedMessages.length <= 1) {
      throw new Error("No valid messages to send to the API");
    }

    const payload: ChatCompletionRequest = {
      model,
      messages: formattedMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
      stop: ['</s>', '<|im_end|>'],
    };
    const res = await togetherFetch("/chat/completions", payload, true);

    if (!res.body) {
      throw new Error("No response body from Together.ai");
    }

    onStart();

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulated = "";
    let doneStream = false;

    while (!doneStream) {
      const { value, done } = await reader.read();
      if (done) break;

      // decode new bytes
      buffer += decoder.decode(value, { stream: true });

      // split on SSE boundary
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || ""; // leftover

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        const payloadLine = line.slice(5).trim();

        if (payloadLine === "[DONE]") {
          doneStream = true;
          break;
        }

        try {
          const json: StreamChunk = JSON.parse(payloadLine);
          const delta = json.choices[0]?.delta?.content;
          if (delta !== undefined) {
            accumulated += delta;
            onTextDelta(delta); // Only send the delta, not the accumulated text
          }
        } catch {
          // ignore non-JSON lines (heartbeats, etc.)
        }
      }
    }

    onComplete();
    return { success: true, data: accumulated, error: null };
  } catch (error: any) {
    console.error("Together API Streaming Error:", error);
    const msg = error.message || "Streaming failed";
    onError(msg);
    return { success: false, data: null, error: msg };
  }
}
