import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "../../../lib/supabase.js";
import { 
  Search, 
  BarChart3, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  CheckCircle 
} from "lucide-react";

export default function Landing() {
  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Search className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-gray-900">SubScout</span>
            </div>
            <div className="flex items-center">
              <Button 
                onClick={handleSignIn}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-login"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-6" data-testid="text-hero-title">
            Customer Development for 
            <span className="text-primary"> Solo Developers</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-hero-description">
            Discover target communities, analyze user needs, and generate engagement strategies 
            using AI-powered insights from Reddit discussions.
          </p>
          <Button 
            onClick={handleSignIn}
            size="lg"
            className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg"
            data-testid="button-get-started"
          >
            Start Your Customer Journey
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <Card className="text-center" data-testid="card-feature-discover">
            <CardHeader>
              <Search className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Discover Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered subreddit discovery finds where your target customers gather and discuss their problems.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="card-feature-analyze">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Analyze Pain Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Extract and visualize user frustrations, feature requests, and trending topics from community discussions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center" data-testid="card-feature-engage">
            <CardHeader>
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Generate Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-drafted first-contact posts help you authentically engage with communities and gather feedback.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12" data-testid="text-how-it-works">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyze Your App</h3>
                <p className="text-gray-600">Enter your app's URL and let AI analyze your product to identify target customer personas.</p>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Communities</h3>
                <p className="text-gray-600">Get ranked recommendations of Reddit communities where your customers are active.</p>
              </div>
            </div>

            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Monitor & Engage</h3>
                <p className="text-gray-600">Track pain points, generate authentic engagement posts, and gather customer insights.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-20 bg-gray-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8" data-testid="text-benefits">
            Perfect for Solo Developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Save Time on Research</h3>
                <p className="text-gray-600">Automated customer discovery instead of manual community hunting.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Lower Barrier to Entry</h3>
                <p className="text-gray-600">AI-generated posts help you engage authentically without marketing expertise.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Structured Insights</h3>
                <p className="text-gray-600">Transform messy discussions into actionable product insights.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Iterate Faster</h3>
                <p className="text-gray-600">Get real user feedback to guide your product development.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" data-testid="text-final-cta">
            Ready to Find Your Customers?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start building better products with real user insights.
          </p>
          <Button 
            onClick={handleSignIn}
            size="lg"
            className="bg-primary hover:bg-primary/90 px-8 py-4 text-lg"
            data-testid="button-start-now"
          >
            Get Started for Free
          </Button>
        </div>
      </div>
    </div>
  );
}
