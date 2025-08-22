import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Users, Activity, Target } from "lucide-react";

interface SubredditDiscoveryProps {
  appId: string;
  onDiscovered: () => void;
}

export default function SubredditDiscovery({ appId, onDiscovered }: SubredditDiscoveryProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { toast } = useToast();

  const discoverMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/apps/${appId}/subreddits/discover`);
      return await response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data);
      onDiscovered();
      toast({
        title: "Discovery Complete",
        description: `Found ${data.length} relevant subreddits for your app.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Discovery Failed",
        description: "Failed to discover subreddits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDiscover = () => {
    discoverMutation.mutate();
  };

  if (discoverMutation.isPending) {
    return (
      <div className="text-center py-8" data-testid="discovery-loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="font-medium text-gray-900 mb-2">Discovering Relevant Subreddits</p>
        <p className="text-sm text-gray-600">Analyzing communities where your customers gather...</p>
      </div>
    );
  }

  if (recommendations.length > 0) {
    return (
      <div className="space-y-4" data-testid="discovery-results">
        <h3 className="font-medium text-gray-900">Recommended Subreddits</h3>
        <div className="space-y-3">
          {recommendations.map((subreddit: any, index: number) => (
            <div 
              key={subreddit.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
              data-testid={`recommendation-${index}`}
            >
              <div className="flex items-center space-x-3">
                <div>
                  <h4 className="font-medium text-gray-900" data-testid={`recommendation-name-${index}`}>
                    r/{subreddit.name}
                  </h4>
                  <p className="text-sm text-gray-600" data-testid={`recommendation-description-${index}`}>
                    {subreddit.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center" data-testid={`recommendation-subscribers-${index}`}>
                  <Users className="h-4 w-4 mr-1" />
                  {subreddit.subscribers 
                    ? `${(subreddit.subscribers / 1000).toFixed(0)}K members`
                    : '--'
                  }
                </span>
                <span className="flex items-center" data-testid={`recommendation-activity-${index}`}>
                  <Activity className="h-4 w-4 mr-1" />
                  {subreddit.activity || 'Unknown'} activity
                </span>
                <Badge 
                  variant="outline"
                  className="bg-green-50 text-green-700"
                  data-testid={`recommendation-match-${index}`}
                >
                  {subreddit.matchScore}% match
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t">
          <Button 
            onClick={handleDiscover}
            variant="outline"
            size="sm"
            data-testid="button-discover-more"
          >
            <Search className="h-4 w-4 mr-2" />
            Discover More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8" data-testid="discovery-prompt">
      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="font-medium text-gray-900 mb-2">Discover Target Communities</h3>
      <p className="text-sm text-gray-600 mb-6">
        Find Reddit communities where your potential customers are active and discussing their problems.
      </p>
      <Button 
        onClick={handleDiscover}
        className="bg-primary hover:bg-primary/90"
        data-testid="button-start-discovery"
      >
        <Search className="h-4 w-4 mr-2" />
        Discover Subreddits
      </Button>
    </div>
  );
}
