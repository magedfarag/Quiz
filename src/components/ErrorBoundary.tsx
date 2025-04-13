import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private getErrorMessage(error: Error): string {
    if (error.message.includes('Cannot access')) {
      return 'There was a problem loading the quiz data. Please try again.';
    }
    if (error.message.includes('Network')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    return 'Something went wrong. Please try again later.';
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                {this.state.error && this.getErrorMessage(this.state.error)}
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition"
              >
                Try Again
              </button>
              
              <Link
                to="/"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg 
                  hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Link>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 p-4 bg-gray-50 rounded-lg">
                <summary className="text-sm text-gray-600 cursor-pointer">Error Details</summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
