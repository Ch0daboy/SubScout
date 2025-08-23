import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import ErrorBoundary, { RouteErrorBoundary, NetworkErrorBoundary } from "@/components/error-boundary";

// Route-based code splitting
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Subreddits = lazy(() => import("@/pages/subreddits"));
const Insights = lazy(() => import("@/pages/insights"));
const Posts = lazy(() => import("@/pages/posts"));

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route
          path="/"
          component={() => (
            <RouteErrorBoundary>
              <Suspense fallback={<div />}> 
                <Landing />
              </Suspense>
            </RouteErrorBoundary>
          )}
        />
      ) : (
        <>
          <Route
            path="/"
            component={() => (
              <RouteErrorBoundary>
                <Suspense fallback={<div />}> 
                  <Dashboard />
                </Suspense>
              </RouteErrorBoundary>
            )}
          />
          <Route
            path="/subreddits"
            component={() => (
              <RouteErrorBoundary>
                <Suspense fallback={<div />}> 
                  <Subreddits />
                </Suspense>
              </RouteErrorBoundary>
            )}
          />
          <Route
            path="/insights"
            component={() => (
              <RouteErrorBoundary>
                <Suspense fallback={<div />}> 
                  <Insights />
                </Suspense>
              </RouteErrorBoundary>
            )}
          />
          <Route
            path="/posts"
            component={() => (
              <RouteErrorBoundary>
                <Suspense fallback={<div />}> 
                  <Posts />
                </Suspense>
              </RouteErrorBoundary>
            )}
          />
        </>
      )}
      <Route
        component={() => (
          <RouteErrorBoundary>
            <Suspense fallback={<div />}> 
              <NotFound />
            </Suspense>
          </RouteErrorBoundary>
        )}
      />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NetworkErrorBoundary>
          <Toaster />
          <Router />
        </NetworkErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
