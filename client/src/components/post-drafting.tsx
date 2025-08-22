import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, Plus, Loader2, Check, Clock, MessageSquare } from "lucide-react";

export default function PostDrafting() {
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>("");
  const { toast } = useToast();

  // Apps query
  const { data: apps } = useQuery({
    queryKey: ["/api/apps"],
  });

  // Subreddits query for selected app
  const { data: subreddits } = useQuery({
    queryKey: ["/api/apps", selectedApp, "subreddits"],
    enabled: !!selectedApp,
  });

  // Recent draft posts query
  const { data: draftPosts, isLoading: draftsLoading } = useQuery({
    queryKey: ["/api/posts", { status: "draft" }],
  });

  // Generate post mutation
  const generatePostMutation = useMutation({
    mutationFn: async () => {
      if (!selectedApp || !selectedSubreddit) {
        throw new Error("Please select an app and subreddit");
      }
      await apiRequest('POST', '/api/posts/generate', {
        appId: selectedApp,
        subredditId: selectedSubreddit,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Post Generated",
        description: "A new draft post has been created for review.",
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
        title: "Generation Failed",
        description: error.message || "Failed to generate post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    generatePostMutation.mutate();
  };

  return (
    <Card data-testid="card-post-drafting">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Edit3 className="mr-2 h-5 w-5 text-primary" />
          Draft Posts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* App Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select App:</label>
          <Select value={selectedApp} onValueChange={setSelectedApp}>
            <SelectTrigger data-testid="select-app-for-post">
              <SelectValue placeholder="Choose an app" />
            </SelectTrigger>
            <SelectContent>
              {apps?.map((app: any) => (
                <SelectItem key={app.id} value={app.id} data-testid={`select-app-option-${app.id}`}>
                  {app.name || 'Untitled App'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subreddit Selection */}
        {selectedApp && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Subreddit:</label>
            <Select value={selectedSubreddit} onValueChange={setSelectedSubreddit}>
              <SelectTrigger data-testid="select-subreddit-for-post">
                <SelectValue placeholder="Choose a subreddit" />
              </SelectTrigger>
              <SelectContent>
                {subreddits?.filter((s: any) => s.isMonitored).map((subreddit: any) => (
                  <SelectItem key={subreddit.id} value={subreddit.id} data-testid={`select-subreddit-option-${subreddit.id}`}>
                    r/{subreddit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate}
          disabled={!selectedApp || !selectedSubreddit || generatePostMutation.isPending}
          className="w-full"
          data-testid="button-generate-post"
        >
          {generatePostMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Generate New Post
            </>
          )}
        </Button>

        {/* Recent Drafts */}
        <div className="space-y-3 mt-6">
          <h4 className="text-sm font-medium text-gray-700">Recent Drafts</h4>
          {draftsLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : draftPosts && draftPosts.length > 0 ? (
            <div className="space-y-3">
              {draftPosts.slice(0, 3).map((post: any, index: number) => (
                <div 
                  key={post.id}
                  className="bg-gray-50 rounded-lg p-3"
                  data-testid={`draft-post-${index}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700" data-testid={`draft-subreddit-${index}`}>
                      r/{post.subreddit?.name || 'unknown'}
                    </span>
                    <Badge variant="outline" className="text-xs" data-testid={`draft-status-${index}`}>
                      <Clock className="h-3 w-3 mr-1" />
                      Ready to review
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2" data-testid={`draft-title-${index}`}>
                    <strong>Title:</strong> {post.title}
                  </div>
                  <div className="text-sm text-gray-600 mb-3" data-testid={`draft-content-preview-${index}`}>
                    {post.content.length > 100 
                      ? `${post.content.substring(0, 100)}...` 
                      : post.content}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.location.href = '/posts'}
                      data-testid={`button-review-${index}`}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500" data-testid="text-no-drafts">
                No draft posts yet. Generate your first post!
              </p>
            </div>
          )}
        </div>

        {/* View All Link */}
        {draftPosts && draftPosts.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/posts'}
            className="w-full text-primary"
            data-testid="button-view-all-posts"
          >
            View All Posts ({draftPosts.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
