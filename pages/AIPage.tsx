import React, { useState } from 'react';
import ImageGenerator from '../components/GenAI/ImageGenerator';
import ImageEditor from '../components/GenAI/ImageEditor';
import { Tab } from '../types';

const AIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'EDIT'>('GENERATE');

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-center mb-8">
        <div className="bg-surface p-1 rounded-lg border border-gray-700 flex">
          <button
            onClick={() => setActiveTab('GENERATE')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'GENERATE' 
                ? 'bg-indigo-600 text-white shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Image Generation
          </button>
          <button
            onClick={() => setActiveTab('EDIT')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'EDIT' 
                ? 'bg-purple-600 text-white shadow' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Image Editing
          </button>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'GENERATE' ? <ImageGenerator /> : <ImageEditor />}
      </div>
    </div>
  );
};

export default AIPage;