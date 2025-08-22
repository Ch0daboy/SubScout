import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeAppUrl(url: string): Promise<{
  name: string;
  description: string;
  targetAudience: string;
  painPoints: string[];
  features: string[];
  tags: string[];
}> {
  try {
    const prompt = `Please analyze this application URL and provide insights: ${url}. Focus on identifying the primary user persona, key pain points the app solves, main features, and relevant tags for categorization. Respond with JSON in this exact format: { 'name': string, 'description': string, 'targetAudience': string, 'painPoints': string[], 'features': string[], 'tags': string[] }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            targetAudience: { type: "string" },
            painPoints: { type: "array", items: { type: "string" } },
            features: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } }
          },
          required: ["name", "description", "targetAudience", "painPoints", "features", "tags"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze app URL: " + (error as Error).message);
  }
}

export async function generateFirstContactPost(
  subredditName: string,
  appDescription: string,
  painPoints: string[]
): Promise<{
  title: string;
  content: string;
}> {
  try {
    const prompt = `Create a first-contact post for r/${subredditName}. The post should:
    - Address common pain points: ${painPoints.join(', ')}
    - Sound authentic and conversational
    - Ask for community input/experiences
    - NOT be promotional or mention the app directly
    - Follow typical Reddit etiquette
    
    App context (for understanding, don't mention directly): ${appDescription}
    
    Respond with JSON in this format: { 'title': string, 'content': string }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" }
          },
          required: ["title", "content"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate post: " + (error as Error).message);
  }
}

export async function analyzePainPointTrends(insights: string[]): Promise<{
  trends: { topic: string; frequency: number; growth: string }[];
  summary: string;
}> {
  try {
    const prompt = `Analyze these customer insights and pain points to identify key trends: ${insights.join('\n\n')}. Respond with JSON in this format: { 'trends': [{ 'topic': string, 'frequency': number, 'growth': string }], 'summary': string }. Growth should be 'rising', 'stable', or 'declining'.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            trends: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  frequency: { type: "number" },
                  growth: { type: "string" }
                },
                required: ["topic", "frequency", "growth"]
              }
            },
            summary: { type: "string" }
          },
          required: ["trends", "summary"]
        }
      },
      contents: prompt,
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze trends: " + (error as Error).message);
  }
}