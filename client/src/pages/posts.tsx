import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import PostDrafting from "@/components/post-drafting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit3, MessageSquare, Check, Clock, Send, Plus } from "lucide-react";

export default function Posts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Posts queries
  const { data: draftPosts, isLoading: draftsLoading } = useQuery({
    queryKey: ["/api/posts", { status: "draft" }],
    enabled: isAuthenticated,
  });

  const { data: approvedPosts, isLoading: approvedLoading } = useQuery({
    queryKey: ["/api/posts", { status: "approved" }],
    enabled: isAuthenticated,
  });

  const { data: publishedPosts, isLoading: publishedLoading } = useQuery({
    queryKey: ["/api/posts", { status: "published" }],
    enabled: isAuthenticated,
  });

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: any }) => {
      await apiRequest('PATCH', `/api/posts/${postId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post Updated",
        description: "Post has been updated successfully.",
      });
      setEditDialogOpen(false);
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
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const approvePost = (postId: string) => {
    updatePostMutation.mutate({ postId, data: { status: 'approved' } });
  };

  const publishPost = (postId: string) => {
    updatePostMutation.mutate({ postId, data: { status: 'published', publishedAt: new Date() } });
  };

  const openEditDialog = (post: any) => {
    setSelectedPost(post);
    setEditDialogOpen(true);
  };

  const saveEdits = (title: string, content: string) => {
    if (selectedPost) {
      updatePostMutation.mutate({ 
        postId: selectedPost.id, 
        data: { title, content } 
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-page-title">
                Post Management
              </h1>
              <p className="text-gray-600">
                Draft, review, and manage your community engagement posts.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="drafts" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3" data-testid="tabs-post-status">
                <TabsTrigger value="drafts" className="flex items-center" data-testid="tab-drafts">
                  <Clock className="h-4 w-4 mr-2" />
                  Drafts ({draftPosts?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center" data-testid="tab-approved">
                  <Check className="h-4 w-4 mr-2" />
                  Approved ({approvedPosts?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="published" className="flex items-center" data-testid="tab-published">
                  <Send className="h-4 w-4 mr-2" />
                  Published ({publishedPosts?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="drafts" className="space-y-4">
                <PostList 
                  posts={draftPosts}
                  isLoading={draftsLoading}
                  emptyMessage="No draft posts yet. Generate some posts to get started."
                  onApprove={approvePost}
                  onEdit={openEditDialog}
                  showActions={true}
                />
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                <PostList 
                  posts={approvedPosts}
                  isLoading={approvedLoading}
                  emptyMessage="No approved posts yet. Approve some drafts first."
                  onPublish={publishPost}
                  onEdit={openEditDialog}
                  showActions={true}
                />
              </TabsContent>

              <TabsContent value="published" className="space-y-4">
                <PostList 
                  posts={publishedPosts}
                  isLoading={publishedLoading}
                  emptyMessage="No published posts yet."
                  showActions={false}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PostDrafting />
            
            {/* Post Stats */}
            <Card data-testid="card-post-stats">
              <CardHeader>
                <CardTitle>Post Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Drafts</span>
                  <span className="font-medium" data-testid="stat-total-drafts">
                    {draftPosts?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-medium" data-testid="stat-approved">
                    {approvedPosts?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Published</span>
                  <span className="font-medium" data-testid="stat-published">
                    {publishedPosts?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditPostDialog 
        post={selectedPost}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={saveEdits}
        isLoading={updatePostMutation.isPending}
      />
    </div>
  );
}

// Post List Component
function PostList({ 
  posts, 
  isLoading, 
  emptyMessage, 
  onApprove, 
  onPublish, 
  onEdit, 
  showActions 
}: {
  posts: any[];
  isLoading: boolean;
  emptyMessage: string;
  onApprove?: (id: string) => void;
  onPublish?: (id: string) => void;
  onEdit?: (post: any) => void;
  showActions: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500" data-testid="text-empty-posts">
            {emptyMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post: any, index: number) => (
        <Card key={post.id} data-testid={`post-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2" data-testid={`post-title-${index}`}>
                  {post.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                  <span data-testid={`post-subreddit-${index}`}>
                    r/{post.subreddit?.name || 'unknown'}
                  </span>
                  <span>•</span>
                  <span data-testid={`post-date-${index}`}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <Badge 
                    variant={
                      post.status === 'draft' ? 'secondary' :
                      post.status === 'approved' ? 'default' : 'outline'
                    }
                    data-testid={`post-status-${index}`}
                  >
                    {post.status}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed" data-testid={`post-content-${index}`}>
                  {post.content.length > 300 
                    ? `${post.content.substring(0, 300)}...` 
                    : post.content}
                </p>
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center space-x-3 pt-4 border-t">
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(post)}
                    data-testid={`button-edit-${index}`}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {onApprove && post.status === 'draft' && (
                  <Button 
                    size="sm"
                    onClick={() => onApprove(post.id)}
                    data-testid={`button-approve-${index}`}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                {onPublish && post.status === 'approved' && (
                  <Button 
                    size="sm"
                    onClick={() => onPublish(post.id)}
                    data-testid={`button-publish-${index}`}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Publish
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Edit Post Dialog Component
function EditPostDialog({ 
  post, 
  open, 
  onOpenChange, 
  onSave, 
  isLoading 
}: {
  post: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string, content: string) => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
    }
  }, [post]);

  const handleSave = () => {
    onSave(title, content);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-post">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
              data-testid="input-edit-title"
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post content..."
              rows={12}
              data-testid="textarea-edit-content"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              data-testid="button-save-edit"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
