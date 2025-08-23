import { useActivities } from "@/hooks/useApps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Search, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Target,
  CheckCircle,
  AlertCircle 
} from "lucide-react";

export default function ActivityFeed() {
  const { data: activities = [], isLoading } = useActivities();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'app_analyzed':
        return <Search className="h-4 w-4 text-blue-500" />;
      case 'subreddits_discovered':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'subreddit_monitored':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'post_generated':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'post_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scan_completed':
        return <TrendingUp className="h-4 w-4 text-indigo-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'app_analyzed':
        return 'bg-blue-500';
      case 'subreddits_discovered':
        return 'bg-green-500';
      case 'subreddit_monitored':
        return 'bg-purple-500';
      case 'post_generated':
        return 'bg-orange-500';
      case 'post_approved':
        return 'bg-green-600';
      case 'scan_completed':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  return (
    <Card data-testid="card-activity-feed">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.slice(0, 10).map((activity: any, index: number) => (
              <div 
                key={activity.id}
                className="flex items-start space-x-3"
                data-testid={`activity-item-${index}`}
              >
                <div className="flex-shrink-0 relative">
                  <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`}></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActivityIcon(activity.type)}
                    <p className="text-sm text-gray-900 font-medium" data-testid={`activity-description-${index}`}>
                      {activity.description}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500" data-testid={`activity-time-${index}`}>
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                  {activity.metadata && (
                    <div className="mt-1">
                      {activity.metadata.count && (
                        <Badge variant="outline" className="text-xs" data-testid={`activity-metadata-${index}`}>
                          {activity.metadata.count} items
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500" data-testid="text-no-activities">
              No recent activities. Start by analyzing your app!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
