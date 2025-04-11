import { ServerCrash } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <ServerCrash className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Server Error</h1>
        <p className="text-gray-600 mb-6">
          Something went wrong on our end. Please try again later.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
