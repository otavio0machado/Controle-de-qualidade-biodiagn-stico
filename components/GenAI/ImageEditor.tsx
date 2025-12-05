import React, { useState, useRef } from 'react';
import { editImage } from '../../services/geminiService';
import { Loader2, Upload, Wand2, ArrowRight } from 'lucide-react';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!prompt || !originalImage) return;
    setLoading(true);
    setError(null);
    try {
      // Strip prefix for API
      const base64Data = originalImage.split(',')[1];
      const mimeType = originalImage.split(';')[0].split(':')[1];
      
      if (!process.env.API_KEY) {
        await window.aistudio?.openSelectKey();
      }

      const result = await editImage(base64Data, prompt, mimeType);
      setEditedImage(result);
    } catch (err: any) {
      setError(err.message || 'Failed to edit image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-surface rounded-xl border border-gray-700 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-lg">
          <Wand2 className="text-purple-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Nano Banana Editor</h2>
          <p className="text-sm text-gray-400">Edit images with natural language using gemini-2.5-flash-image</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-gray-600 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-800/50 transition-all ${originalImage ? 'p-2' : ''}`}
          >
            {originalImage ? (
              <img src={originalImage} alt="Original" className="h-full object-contain rounded-lg" />
            ) : (
              <div className="text-center p-6">
                <Upload className="mx-auto text-gray-500 mb-2" size={32} />
                <p className="text-gray-400 font-medium">Click to upload an image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG supported</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Add a retro filter', 'Remove the background'"
              className="w-full bg-background border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none pr-32"
            />
            <button
              onClick={handleEdit}
              disabled={loading || !prompt || !originalImage}
              className={`absolute right-1 top-1 bottom-1 px-4 rounded-md font-medium text-sm transition-colors ${
                loading || !prompt || !originalImage
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Edit'}
            </button>
          </div>
          
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Output Section */}
        <div className="border border-gray-700 bg-background/50 rounded-xl h-[420px] flex flex-col items-center justify-center relative overflow-hidden">
          {editedImage ? (
            <img src={editedImage} alt="Edited" className="h-full w-full object-contain p-2" />
          ) : (
            <div className="text-center text-gray-500">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-purple-500" size={40} />
                  <p className="animate-pulse">Magic in progress...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ArrowRight size={32} className="text-gray-700" />
                  <p>Edited image will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;