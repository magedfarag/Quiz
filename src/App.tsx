import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * App component is currently not used directly.
 * The actual routing configuration is in main.tsx
 * This file is kept as a placeholder in case we need to add
 * global context providers or other app-level functionality in the future.
 */
const App: React.FC = () => {
  return (
    <div className="app">
      {/* App content is managed by RouterProvider in main.tsx */}
      <div>App content is provided by RouterProvider in main.tsx</div>
    </div>
  );
};

export default App;
