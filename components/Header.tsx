import React from 'react';
import { TrendingUp, Eye } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 bg-opacity-80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.hash = ''}>
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-lg flex items-center justify-center relative shadow-md group-hover:shadow-lg transition-all">
            <Eye className="text-white h-5 w-5 absolute opacity-30 scale-150" />
            <TrendingUp className="text-white h-5 w-5 relative z-10" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Look<span className="text-indigo-600">Trending</span></span>
        </div>
        
        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Trends</a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Sources</a>
          <div className="h-4 w-px bg-gray-200"></div>
          <div className="flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Research
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;