
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
        <div className="relative">
          <div className="loader-modern mb-6"></div>
          {/* Decorative circles */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Generating Your Questions
          </h3>
          <p className="text-lg text-slate-800 dark:text-slate-300 font-bold leading-relaxed">
            AI is crafting personalized TOEIC questions for you...
          </p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
    </div>
  );
};
