import { NextResponse } from "next/server";

interface ModelStatus {
  name: string;
  available: boolean;
  active: boolean;
  type: "local" | "cloud";
}

export async function GET() {
  const useLocal = process.env.USE_LOCAL_MODEL === "true";
  const localUrl = process.env.LOCAL_MODEL_URL;
  const localModel = process.env.LOCAL_MODEL || "mistral";
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const models: ModelStatus[] = [];

  if (useLocal && localUrl) {
    let localAvailable = false;
    try {
      const response = await fetch(`${localUrl}/api/tags`, {
        method: "GET",
      });
      localAvailable = response.ok;
    } catch {
      localAvailable = false;
    }

    models.push({
      name: localModel,
      available: localAvailable,
      active: useLocal && localAvailable,
      type: "local",
    });
  }

  if (openaiKey) {
    models.push({
      name: openaiModel,
      available: true,
      active: !useLocal || models.some((m) => m.type === "local" && !m.available),
      type: "cloud",
    });
  }

  const activeModel = models.find((m) => m.active);

  return NextResponse.json({
    status: "ok",
    activeModel: activeModel?.name || "none",
    models,
    configuration: {
      useLocal,
      localUrl: useLocal ? localUrl : null,
      localModel: useLocal ? localModel : null,
      hasOpenAiKey: !!openaiKey,
    },
  });
}
