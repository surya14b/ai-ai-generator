import React, { useState } from 'react';

// LoadingSpinner Component
const LoadingSpinner = ({ message }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-2xl text-center">
      <div className="flex flex-col items-center">
        {/* Animated Spinner */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-purple-300 border-solid rounded-full animate-spin border-t-transparent"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-blue-300 border-solid rounded-full animate-ping opacity-20"></div>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-4">Creating Your Video Ad</h3>
          <p className="text-lg text-gray-300">{message}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md bg-white/20 rounded-full h-2 mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        
        {/* Steps Indicator */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-green-400">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Scraping
          </div>
          <div className="w-2 h-px bg-gray-400"></div>
          <div className="flex items-center text-yellow-400">
            <div className="w-4 h-4 mr-1 border-2 border-current rounded-full animate-pulse"></div>
            AI Script
          </div>
          <div className="w-2 h-px bg-gray-400"></div>
          <div className="flex items-center text-gray-400">
            <div className="w-4 h-4 mr-1 border-2 border-current rounded-full"></div>
            Video
          </div>
        </div>
      </div>
    </div>
  );
};

// ErrorMessage Component
const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="bg-red-500/20 border border-red-500/50 backdrop-blur-md rounded-xl p-4 mb-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-red-200 font-medium">Error</p>
            <p className="text-red-300 text-sm">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ videos, onBackToInput, onRefresh }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    setDeleteLoading(filename);
    try {
      const response = await fetch(`http://localhost:3001/api/videos/${filename}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        onRefresh();
      } else {
        alert('Failed to delete video');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete video');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDownload = async (videoUrl, filename) => {
    try {
      const response = await fetch(`http://localhost:3001${videoUrl}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download video');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Video Dashboard</h2>
            <p className="text-gray-300">Manage your generated video advertisements</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            <button
              onClick={onBackToInput}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Video
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 shadow-xl text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Videos Yet</h3>
          <p className="text-gray-300 mb-6">Create your first AI-generated video advertisement</p>
          <button
            onClick={onBackToInput}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-xl hover:bg-white/15 transition-all">
              {/* Video Thumbnail/Player */}
              <div className="bg-black rounded-lg overflow-hidden mb-4">
                <video
                  className="w-full h-48 object-cover"
                  poster="/api/placeholder/300/200"
                  onClick={() => setSelectedVideo(selectedVideo === video ? null : video)}
                  style={{ cursor: 'pointer' }}
                >
                  <source src={`http://localhost:3001${video.url}`} type="video/mp4" />
                </video>
                {selectedVideo === video && (
                  <video
                    controls
                    className="w-full"
                    autoPlay
                  >
                    <source src={`http://localhost:3001${video.url}`} type="video/mp4" />
                  </video>
                )}
              </div>

              {/* Video Info */}
              <div className="space-y-2 mb-4">
                <h4 className="text-white font-medium truncate">{video.filename}</h4>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>{formatFileSize(video.size)}</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(video.url, video.filename)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => handleDelete(video.filename)}
                  disabled={deleteLoading === video.filename}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleteLoading === video.filename ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {videos.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">{videos.length}</p>
              <p className="text-gray-300 text-sm">Total Videos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-400">
                {formatFileSize(videos.reduce((total, video) => total + video.size, 0))}
              </p>
              <p className="text-gray-300 text-sm">Total Size</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">
                {Math.round(videos.reduce((total, video) => total + video.size, 0) / videos.length / 1024 / 1024 * 100) / 100} MB
              </p>
              <p className="text-gray-300 text-sm">Avg Size</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {videos.length > 0 ? formatDate(videos[0].createdAt).split(',')[0] : 'N/A'}
              </p>
              <p className="text-gray-300 text-sm">Latest</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { LoadingSpinner, ErrorMessage, Dashboard };