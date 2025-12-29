import React, { useState } from 'react';
import { analyzeProductImage, generateLifestyleImage, generateAdVideo } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import FileUpload from './components/FileUpload';
import ResultDashboard from './components/ResultDashboard';
import { AlertCircle, Terminal, Wand2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setAppState(AppState.ANALYZING);
    setAnalysis(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      // Remove data URL prefix for API call, keep complete string for UI display
      setOriginalImage(base64String);
      const base64Data = base64String.split(',')[1];
      
      try {
        const result = await analyzeProductImage(base64Data, file.type);
        
        if (!result.is_valid) {
          throw new Error(result.error_message || "Invalid image content.");
        }

        setAnalysis(result);
        setAppState(AppState.IDLE); // Ready for next step
      } catch (err: any) {
        setError(err.message || "Failed to analyze image.");
        setAppState(AppState.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVisuals = async () => {
    if (!analysis) return;

    try {
      // 1. Generate Image
      setAppState(AppState.GENERATING_IMAGE);
      const imageResult = await generateLifestyleImage(
        analysis.imagen_params.prompt,
        analysis.imagen_params.aspect_ratio
      );
      setGeneratedImage(imageResult);

      // 2. Generate Video
      setAppState(AppState.GENERATING_VIDEO);
      const videoResult = await generateAdVideo(
        analysis.veo_params.prompt,
        analysis.veo_params.aspect_ratio
      );
      setGeneratedVideo(videoResult);

      setAppState(AppState.COMPLETE);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Visual generation failed.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 text-slate-200 p-4 md:p-8">
      
      {/* Header */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            E-Com Visual Suite
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-slate-500 font-medium">
          <span className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Powered by Gemini 1.5 Pro</span>
          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
          <span>Imagen 3</span>
          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
          <span>Veo 3.1</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center gap-12">
        
        {/* Error Toast */}
        {error && (
          <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-right-10">
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-4 hover:text-white">&times;</button>
            </div>
          </div>
        )}

        {/* Upload Area - Hide if we have results, or keep compact? Let's hide to focus on results, or move to top */}
        {!analysis && (
          <section className="w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                Turn Product Shots into <span className="text-indigo-400">Campaigns</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Upload a raw product image. Our AI creative director will generate SEO copy, social posts, luxury lifestyle photography, and a cinematic video ad in seconds.
              </p>
            </div>
            <FileUpload 
              onFileSelect={handleFileSelect} 
              isAnalyzing={appState === AppState.ANALYZING} 
            />
          </section>
        )}

        {/* Dashboard */}
        {analysis && (
          <ResultDashboard 
            analysis={analysis}
            generatedImage={generatedImage}
            generatedVideo={generatedVideo}
            appState={appState}
            onGenerateVisuals={handleGenerateVisuals}
            originalImage={originalImage}
          />
        )}
        
        {/* Restart Button (only when analysis exists) */}
        {analysis && appState !== AppState.ANALYZING && appState !== AppState.GENERATING_IMAGE && appState !== AppState.GENERATING_VIDEO && (
          <button 
            onClick={() => {
              setAnalysis(null);
              setGeneratedImage(null);
              setGeneratedVideo(null);
              setOriginalImage(null);
              setAppState(AppState.IDLE);
            }}
            className="text-slate-500 hover:text-white text-sm transition-colors mt-8"
          >
            Start New Project
          </button>
        )}

      </main>
    </div>
  );
};

export default App;
