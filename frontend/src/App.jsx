import React, { useState } from 'react';
import URLInput from './components/URLInput';
import VideoPreview from './components/VideoPreview';
import { Dashboard, LoadingSpinner, ErrorMessage } from './components/Dashboard';
import { apiService } from './services/api';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('input'); // input, loading, preview, dashboard
  const [productData, setProductData] = useState(null);
  const [script, setScript] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedVideos, setGeneratedVideos] = useState([]);

  const handleURLSubmit = async (url) => {
    setLoading(true);
    setError(null);
    setCurrentStep('loading');
    
    try {
      // Use API service for complete pipeline
      const result = await apiService.createVideoAd(url, (step, message) => {
        setLoadingStep(message || `Processing ${step}...`);
      });

      setProductData(result.productData);
      setScript(result.script);
      setVideoData(result.video);
      setCurrentStep('preview');

    } catch (error) {
      console.error('Error creating video ad:', error);
      setError(error.message);
      setCurrentStep('input');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleBackToInput = () => {
    setCurrentStep('input');
    setProductData(null);
    setScript(null);
    setVideoData(null);
    setError(null);
  };

  const handleViewDashboard = async () => {
    try {
      const videos = await apiService.getVideos();
      setGeneratedVideos(videos);
      setCurrentStep('dashboard');
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to load video dashboard');
    }
  };

  const handleGenerateAlternative = async () => {
    if (!productData || !script) return;

    setLoading(true);
    setError(null);
    
    try {
      // Generate alternative script
      const newScript = await apiService.generateAlternativeScript(productData, script);

      // Generate video with new script
      const newVideoData = await apiService.generateVideo(productData, newScript);
      
      setScript(newScript);
      setVideoData(newVideoData);

    } catch (error) {
      console.error('Error generating alternative:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎬 AI Video Ad Generator
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform any product URL into compelling video advertisements using AI
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-1">
            <button
              onClick={handleBackToInput}
              className={`px-6 py-2 rounded-md transition-all ${
                currentStep === 'input' 
                  ? 'bg-white text-purple-900 font-semibold' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Create Video
            </button>
            <button
              onClick={handleViewDashboard}
              className={`px-6 py-2 rounded-md transition-all ${
                currentStep === 'dashboard' 
                  ? 'bg-white text-purple-900 font-semibold' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              My Videos
            </button>
          </div>
        </nav>

        {/* Error Display */}
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={() => setError(null)} 
          />
        )}

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {currentStep === 'input' && (
            <URLInput 
              onSubmit={handleURLSubmit} 
              loading={loading}
            />
          )}

          {currentStep === 'loading' && (
            <LoadingSpinner 
              message={loadingStep || "Processing your request..."} 
            />
          )}

          {currentStep === 'preview' && videoData && (
            <VideoPreview
              productData={productData}
              script={script}
              videoData={videoData}
              onGenerateAlternative={handleGenerateAlternative}
              onBackToInput={handleBackToInput}
              loading={loading}
            />
          )}

          {currentStep === 'dashboard' && (
            <Dashboard
              videos={generatedVideos}
              onBackToInput={handleBackToInput}
              onRefresh={handleViewDashboard}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-400">
          <p>Built with React, Node.js, OpenAI, and FFmpeg</p>
          <p className="text-sm mt-2">© 2024 AI Video Ad Generator - Demo Project</p>
        </footer>
      </div>
    </div>
  );
}

export default App;