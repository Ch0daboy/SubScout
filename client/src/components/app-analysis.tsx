import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Search, Loader2 } from "lucide-react";

export default function AppAnalysis() {
  const [appUrl, setAppUrl] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const analyzeAppMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/apps', { url });
      return await response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Analysis Complete",
        description: "Your app has been analyzed successfully!",
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
        title: "Analysis Failed",
        description: "Failed to analyze your app. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!appUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter your app's URL.",
        variant: "destructive",
      });
      return;
    }

    analyzeAppMutation.mutate(appUrl);
  };

  return (
    <Card data-testid="card-app-analysis">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="mr-2 h-5 w-5 text-primary" />
          Your App Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Input
            type="url"
            placeholder="Enter your app's URL..."
            value={appUrl}
            onChange={(e) => setAppUrl(e.target.value)}
            className="flex-1"
            disabled={analyzeAppMutation.isPending}
            data-testid="input-app-url"
          />
          <Button 
            onClick={handleAnalyze}
            disabled={analyzeAppMutation.isPending || !appUrl.trim()}
            data-testid="button-analyze-app"
          >
            {analyzeAppMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {analysis && (
          <div className="bg-gray-50 rounded-lg p-4" data-testid="analysis-results">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2" data-testid="analysis-title">
                  AI Analysis Complete
                </h3>
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-1" data-testid="analysis-app-name">
                    {analysis.name || 'Your App'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3" data-testid="analysis-description">
                    {analysis.description}
                  </p>
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Target Audience:</strong> <span data-testid="analysis-target-audience">{analysis.targetAudience}</span>
                    </p>
                  </div>
                </div>
                {analysis.tags && analysis.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        data-testid={`analysis-tag-${index}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {analyzeAppMutation.isPending && (
          <div className="bg-blue-50 rounded-lg p-4 flex items-center" data-testid="analysis-loading">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="font-medium text-gray-900">Analyzing your app...</p>
              <p className="text-sm text-gray-600">This may take a few moments</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
