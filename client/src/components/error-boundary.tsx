import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isAppError } from '@shared/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);

    // Report to error monitoring service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, you would send this to your error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error report:', errorReport);
    
    // Example: Send to monitoring service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  };

  protected handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  protected handleReload = () => {
    window.location.reload();
  };

  protected handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-gray-600">
                We apologize for the inconvenience. An unexpected error has occurred.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">{isAppError(this.state.error) ? this.state.error.userMessage : 'Unexpected error'}</h4>
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <p className="text-xs text-red-700 font-mono break-all">
                        {this.state.error.message}
                      </p>
                      {this.state.error.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                          <pre className="text-xs text-red-700 mt-1 whitespace-pre-wrap">
                            {this.state.error.stack}
                          </pre>
                        </details>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload} 
                  variant="outline" 
                  className="w-full"
                >
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome} 
                  variant="ghost" 
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                If this problem persists, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different contexts

// Network/API error boundary
export class NetworkErrorBoundary extends ErrorBoundary {
  render() {
    if (this.state.hasError) {
      const isNetworkError = this.state.error?.message?.includes('fetch') || 
                            this.state.error?.message?.includes('Network');
      
      if (isNetworkError) {
        return (
          <div className="text-center p-8">
            <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Problem</h3>
            <p className="text-gray-600 mb-4">
              Unable to connect to the server. Please check your internet connection.
            </p>
            <Button onClick={this.handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        );
      }
    }

    return super.render();
  }
}

// Route-level error boundary
export class RouteErrorBoundary extends ErrorBoundary {
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Error</h1>
            <p className="text-gray-600 mb-6">
              This page encountered an error and couldn't be displayed.
            </p>
            <div className="space-x-4">
              <Button onClick={this.handleGoHome}>
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
