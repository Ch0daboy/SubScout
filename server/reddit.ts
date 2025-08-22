interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface RedditSubreddit {
  data: {
    display_name: string;
    display_name_prefixed: string;
    title: string;
    public_description: string;
    subscribers: number;
    active_user_count: number;
    over18: boolean;
  };
}

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    url: string;
    score: number;
    num_comments: number;
    created_utc: number;
    subreddit: string;
    author: string;
    permalink: string;
  };
}

interface RedditSearchResponse {
  data: {
    children: RedditPost[];
    after: string | null;
  };
}

class RedditAPI {
  private accessToken: string | null = null;
  private tokenExpires: number = 0;

  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpires) {
      return this.accessToken;
    }

    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Reddit API credentials not configured');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'SubScout/1.0.0'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status} ${response.statusText}`);
    }

    const data: RedditTokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpires = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

    return this.accessToken;
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const token = await this.authenticate();
    
    const response = await fetch(`https://oauth.reddit.com${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'SubScout/1.0.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getSubredditInfo(subredditName: string): Promise<{
    name: string;
    displayName: string;
    description: string;
    subscribers: number;
    activeUsers: number;
    isNsfw: boolean;
  } | null> {
    try {
      const data = await this.makeRequest(`/r/${subredditName}/about`);
      const subreddit: RedditSubreddit = data;
      
      return {
        name: subreddit.data.display_name,
        displayName: subreddit.data.display_name_prefixed,
        description: subreddit.data.public_description || subreddit.data.title,
        subscribers: subreddit.data.subscribers,
        activeUsers: subreddit.data.active_user_count || 0,
        isNsfw: subreddit.data.over18
      };
    } catch (error) {
      console.error(`Failed to get subreddit info for ${subredditName}:`, error);
      return null;
    }
  }

  async searchSubreddit(subredditName: string, query: string, limit: number = 10): Promise<{
    title: string;
    content: string;
    url: string;
    score: number;
    comments: number;
    createdAt: Date;
    author: string;
    permalink: string;
  }[]> {
    try {
      const endpoint = `/r/${subredditName}/search?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&limit=${limit}`;
      const data: RedditSearchResponse = await this.makeRequest(endpoint);
      
      return data.data.children.map(post => ({
        title: post.data.title,
        content: post.data.selftext,
        url: post.data.url,
        score: post.data.score,
        comments: post.data.num_comments,
        createdAt: new Date(post.data.created_utc * 1000),
        author: post.data.author,
        permalink: `https://reddit.com${post.data.permalink}`
      }));
    } catch (error) {
      console.error(`Failed to search subreddit ${subredditName}:`, error);
      return [];
    }
  }

  async getHotPosts(subredditName: string, limit: number = 25): Promise<{
    title: string;
    content: string;
    url: string;
    score: number;
    comments: number;
    createdAt: Date;
    author: string;
    permalink: string;
  }[]> {
    try {
      const endpoint = `/r/${subredditName}/hot?limit=${limit}`;
      const data: RedditSearchResponse = await this.makeRequest(endpoint);
      
      return data.data.children.map(post => ({
        title: post.data.title,
        content: post.data.selftext,
        url: post.data.url,
        score: post.data.score,
        comments: post.data.num_comments,
        createdAt: new Date(post.data.created_utc * 1000),
        author: post.data.author,
        permalink: `https://reddit.com${post.data.permalink}`
      }));
    } catch (error) {
      console.error(`Failed to get hot posts from ${subredditName}:`, error);
      return [];
    }
  }

  async scanSubredditForInsights(subredditName: string): Promise<{
    painPoints: string[];
    featureRequests: string[];
    commonTopics: string[];
    posts: any[];
  }> {
    try {
      const posts = await this.getHotPosts(subredditName, 50);
      
      const painPointKeywords = ['problem', 'issue', 'frustrating', 'difficult', 'annoying', 'hate', 'sucks', 'broken'];
      const featureRequestKeywords = ['want', 'need', 'wish', 'should', 'could', 'feature', 'improvement'];
      
      const painPoints: string[] = [];
      const featureRequests: string[] = [];
      const topics: { [key: string]: number } = {};
      
      posts.forEach(post => {
        const text = (post.title + ' ' + post.content).toLowerCase();
        
        // Extract pain points
        painPointKeywords.forEach(keyword => {
          if (text.includes(keyword)) {
            painPoints.push(post.title);
          }
        });
        
        // Extract feature requests
        featureRequestKeywords.forEach(keyword => {
          if (text.includes(keyword)) {
            featureRequests.push(post.title);
          }
        });
        
        // Count topic mentions (simple word frequency)
        const words = text.split(' ').filter(word => word.length > 4);
        words.forEach(word => {
          topics[word] = (topics[word] || 0) + 1;
        });
      });
      
      const commonTopics = Object.entries(topics)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([topic]) => topic);
      
      return {
        painPoints: [...new Set(painPoints)].slice(0, 10),
        featureRequests: [...new Set(featureRequests)].slice(0, 10),
        commonTopics,
        posts: posts.slice(0, 10)
      };
    } catch (error) {
      console.error(`Failed to scan subreddit ${subredditName}:`, error);
      return {
        painPoints: [],
        featureRequests: [],
        commonTopics: [],
        posts: []
      };
    }
  }
}

export const redditAPI = new RedditAPI();