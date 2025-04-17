import React from 'react';
import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

const RouteError: React.FC = () => {
  const error = useRouteError();
  
  let errorMessage = 'An unexpected error occurred';
  let errorStatus = '';
  
  if (isRouteErrorResponse(error)) {
    // Error from React Router
    errorStatus = `${error.status}`;
    errorMessage = error.statusText || errorMessage;
    if (error.data?.message) {
      errorMessage = error.data.message;
    }
  } else if (error instanceof Error) {
    // JavaScript Error object
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    // Plain string error
    errorMessage = error;
  }

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
        
        {errorStatus && (
          <h1 className="text-4xl font-bold text-red-600 mb-2">Error {errorStatus}</h1>
        )}
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {!errorStatus && 'Oops! Something went wrong'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl
              hover:bg-primary-700 transition transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
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
};

export default RouteError;