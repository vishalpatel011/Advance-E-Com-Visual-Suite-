import React from 'react';
import { AnalysisResult, AppState } from '../types';
import { Copy, Check, Download, Play, Image as ImageIcon, Sparkles, Loader2, Video as VideoIcon } from 'lucide-react';

interface ResultDashboardProps {
  analysis: AnalysisResult;
  generatedImage: string | null;
  generatedVideo: string | null;
  appState: AppState;
  onGenerateVisuals: () => void;
  originalImage: string | null;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ 
  analysis, 
  generatedImage, 
  generatedVideo, 
  appState, 
  onGenerateVisuals,
  originalImage
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isGenerating = appState === AppState.GENERATING_IMAGE || appState === AppState.GENERATING_VIDEO;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
      
      {/* LEFT COLUMN: Marketing Intelligence */}
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">Marketing Intelligence</h2>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 block">Optimized Title</label>
              <div className="relative group">
                <p className="text-lg text-white font-medium bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  {analysis.product_title}
                </p>
                <button 
                  onClick={() => copyToClipboard(analysis.product_title, 'title')}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                >
                  {copiedField === 'title' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 block">SEO Description</label>
              <div className="relative group">
                <p className="text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-sm">
                  {analysis.seo_description}
                </p>
                <button 
                  onClick={() => copyToClipboard(analysis.seo_description, 'desc')}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                >
                  {copiedField === 'desc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Social Posts */}
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 block">Social Campaigns</label>
              <div className="grid gap-3">
                {(Object.entries(analysis.social_posts) as [string, string][]).map(([platform, text]) => (
                  <div key={platform} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/30 group relative hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize text-xs font-bold text-indigo-300 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">{platform}</span>
                      <button 
                        onClick={() => copyToClipboard(text, platform)}
                        className="text-slate-500 hover:text-white transition-colors"
                      >
                        {copiedField === platform ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm italic">"{text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Visual Assets */}
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6 md:p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Visual Suite</h2>
            </div>
            
            {!generatedImage && !isGenerating && (
              <button 
                onClick={onGenerateVisuals}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Assets
              </button>
            )}
          </div>

          <div className="flex-1 space-y-8">
            {/* Image Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" />
                  Imagen 3 Luxury Shot
                </label>
                {generatedImage && (
                  <button 
                    onClick={() => downloadAsset(generatedImage, 'luxury-shot.png')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download PNG
                  </button>
                )}
              </div>
              
              <div className="aspect-square w-full rounded-xl bg-slate-900 border border-slate-700/50 overflow-hidden relative group">
                {appState === AppState.GENERATING_IMAGE ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
                    <p className="text-slate-400 text-sm animate-pulse">Rendering high-res texture...</p>
                  </div>
                ) : generatedImage ? (
                  <img src={generatedImage} alt="Generated Luxury" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                    <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                      <ImageIcon className="w-6 h-6 opacity-50" />
                    </div>
                    <p className="text-sm">Ready to generate</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                  <VideoIcon className="w-3 h-3" />
                  Veo 3.1 Cinematic Ad
                </label>
                {generatedVideo && (
                  <button 
                    onClick={() => downloadAsset(generatedVideo, 'cinematic-ad.mp4')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download MP4
                  </button>
                )}
              </div>
              
              <div className="aspect-video w-full rounded-xl bg-slate-900 border border-slate-700/50 overflow-hidden relative group">
                {appState === AppState.GENERATING_VIDEO ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10">
                    <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-3" />
                    <p className="text-slate-400 text-sm animate-pulse">Filming cinematic sequence...</p>
                    <p className="text-xs text-slate-600 mt-2">This may take ~30 seconds</p>
                  </div>
                ) : generatedVideo ? (
                  <video 
                    src={generatedVideo} 
                    controls 
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-800/20">
                    <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                      <Play className="w-6 h-6 opacity-50 ml-1" />
                    </div>
                    <p className="text-sm">{generatedImage ? 'Waiting for generation...' : 'Requires Image Generation first'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDashboard;