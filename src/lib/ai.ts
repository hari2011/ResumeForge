import OpenAI from "openai";

const defaultOpenAiModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const localModelUrl = process.env.LOCAL_MODEL_URL;
const localModel = process.env.LOCAL_MODEL ?? "mistral";
const useLocal = process.env.USE_LOCAL_MODEL === "true";

async function callLocalLlm(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  if (!localModelUrl) return null;

  try {
    const response = await fetch(`${localModelUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: localModel,
        prompt: `${systemPrompt}\n\nUser: ${userPrompt}`,
        stream: false,
        temperature: 0.4,
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { response: string };
    return data.response?.trim() || null;
  } catch {
    return null;
  }
}

async function callOpenAi(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: defaultOpenAiModel,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    });

    return response.output_text?.trim() || null;
  } catch {
    return null;
  }
}

export async function callOptionalAi(
  systemPrompt: string,
  userPrompt: string,
  fallback: string
): Promise<string> {
  let result: string | null = null;

  // 1. Try local model first (if configured)
  if (useLocal && localModelUrl) {
    result = await callLocalLlm(systemPrompt, userPrompt);
    if (result) return result;
  }

  // 2. Try OpenAI (if key is configured)
  result = await callOpenAi(systemPrompt, userPrompt);
  if (result) return result;

  // 3. Fall back to deterministic heuristics
  return fallback;
}


