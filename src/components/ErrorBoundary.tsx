import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // You could also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8 flex items-center justify-center">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We've encountered an unexpected error. Please try refreshing the page or return to the home page.
            </p>
            {this.state.error && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left overflow-auto">
                <p className="text-sm font-mono text-red-600 mb-2">{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <details className="text-xs text-gray-700">
                    <summary className="cursor-pointer py-1">View details</summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl
                  hover:bg-primary-700 transition transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 rounded-xl
                  hover:bg-gray-300 transition transform hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
