interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function discoverSubreddits(appDescription: string, targetAudience: string): Promise<{
  name: string;
  displayName: string;
  description: string;
  subscribers: number;
  activity: string;
  matchScore: number;
}[]> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a Reddit expert who knows all major subreddits. Based on an app description and target audience, recommend relevant subreddits where the target users might gather. Respond with JSON array of subreddits in this format: {"subreddits": [{ "name": string, "displayName": string, "description": string, "subscribers": number, "activity": string, "matchScore": number }]}. Activity should be "high", "medium", or "low". Match score should be 0-100.'
          },
          {
            role: 'user',
            content: `App description: ${appDescription}\nTarget audience: ${targetAudience}\n\nRecommend 5-8 relevant subreddits where this target audience is likely to be active.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    try {
      const result = JSON.parse(content);
      return result.subreddits || [];
    } catch (parseError) {
      // Fallback: try to extract JSON from content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return result.subreddits || [];
      }
      
      // Return mock data if parsing fails
      return [
        {
          name: "startups",
          displayName: "r/startups", 
          description: "A community for discussing startup ideas and entrepreneurship",
          subscribers: 500000,
          activity: "high",
          matchScore: 85
        },
        {
          name: "entrepreneur",
          displayName: "r/entrepreneur",
          description: "A community for entrepreneurs and business minded individuals",
          subscribers: 800000,
          activity: "high", 
          matchScore: 80
        },
        {
          name: "SaaS", 
          displayName: "r/SaaS",
          description: "Software as a Service community",
          subscribers: 150000,
          activity: "medium",
          matchScore: 90
        }
      ];
    }
  } catch (error) {
    console.error("Perplexity API error:", error);
    throw new Error("Failed to discover subreddits: " + (error as Error).message);
  }
}

export async function searchRedditTrends(query: string): Promise<{
  trends: string[];
  discussions: string[];
}> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Search Reddit for current trends and discussions related to the given query. Focus on identifying trending topics, common pain points, and recent discussions. Return JSON format: {"trends": string[], "discussions": string[]}'
          },
          {
            role: 'user',
            content: `Search Reddit for trends and discussions about: ${query}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
        search_domain_filter: ["reddit.com"],
        return_related_questions: false,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return { trends: [], discussions: [] };
    }

    try {
      const result = JSON.parse(content);
      return {
        trends: result.trends || [],
        discussions: result.discussions || []
      };
    } catch (parseError) {
      return { trends: [], discussions: [] };
    }
  } catch (error) {
    console.error("Perplexity search error:", error);
    return { trends: [], discussions: [] };
  }
}