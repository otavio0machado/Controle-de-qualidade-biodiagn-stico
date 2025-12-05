import React, { useState } from 'react';
import { generateImage } from '../../services/geminiService';
import { ImageSize } from '../../types';
import { Loader2, Download, Image as ImageIcon } from 'lucide-react';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        await window.aistudio?.openSelectKey();
      }
      const result = await generateImage(prompt, size);
      setImage(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-surface rounded-xl border border-gray-700 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-500/20 rounded-lg">
          <ImageIcon className="text-indigo-400" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Nano Banana Pro Generator</h2>
          <p className="text-sm text-gray-400">High-quality image generation powered by gemini-3-pro</p>
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full h-32 bg-background border border-gray-600 rounded-lg p-4 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none"
        />

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
            {[ImageSize.SIZE_1K, ImageSize.SIZE_2K, ImageSize.SIZE_4K].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  size === s 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 ${
              loading || !prompt
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {image && (
          <div className="mt-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end justify-center pb-6">
              <a 
                href={image} 
                download={`generated-${Date.now()}.png`}
                className="bg-white text-black px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Download size={18} /> Download
              </a>
            </div>
            <img 
              src={image} 
              alt="Generated" 
              className="w-full rounded-xl border border-gray-700 shadow-2xl" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;