import React, { useState } from 'react';

const VideoPreview = ({ 
  productData, 
  script, 
  videoData, 
  onGenerateAlternative, 
  onBackToInput, 
  loading 
}) => {
  const [showScript, setShowScript] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');

  const handleDownload = async () => {
    try {
      setDownloadStatus('downloading');
      
      const response = await fetch(`http://localhost:3001${videoData.videoUrl}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${productData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_video_ad.mp4`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus(''), 3000);
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    return `${seconds}s`;
  };

  return (
    <div className="space-y-8">
      {/* Video Player Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            🎬 Your Video Ad is Ready!
          </h2>
          <p className="text-gray-300">
            Preview your AI-generated video advertisement
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Video Player */}
          <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
            <video
              controls
              className="w-full h-auto"
              poster="/api/placeholder/400/600"
            >
              <source src={`http://localhost:3001${videoData.videoUrl}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Info */}
          <div className="mt-4 bg-white/5 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-white font-semibold">{formatDuration(videoData.duration)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">File Size</p>
                <p className="text-white font-semibold">{formatFileSize(videoData.fileSize)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Format</p>
                <p className="text-white font-semibold">MP4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={handleDownload}
            disabled={downloadStatus === 'downloading'}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {downloadStatus === 'downloading' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : downloadStatus === 'success' ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Downloaded!
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Video
              </>
            )}
          </button>

          <button
            onClick={onGenerateAlternative}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Generate Alternative
              </>
            )}
          </button>

          <button
            onClick={() => setShowScript(!showScript)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            {showScript ? 'Hide Script' : 'View Script'}
          </button>

          <button
            onClick={onBackToInput}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Create Another Video
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Product Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Title</p>
              <p className="text-white font-medium">{productData.title}</p>
            </div>
            
            {productData.price && (
              <div>
                <p className="text-gray-400 text-sm">Price</p>
                <p className="text-white font-medium">{productData.price}</p>
              </div>
            )}
            
            <div>
              <p className="text-gray-400 text-sm">Description</p>
              <p className="text-white text-sm">{productData.description}</p>
            </div>
            
            {productData.features && productData.features.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm">Key Features</p>
                <ul className="text-white text-sm space-y-1">
                  {productData.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Script Details */}
        {showScript && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              Video Script
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm">Script Title</p>
                <p className="text-white font-medium">{script.title}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Total Duration</p>
                <p className="text-white font-medium">{formatDuration(script.totalDuration)}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Scenes</p>
                <div className="space-y-3">
                  {script.scenes.map((scene, index) => (
                    <div key={scene.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-purple-400 font-medium capitalize">
                          {scene.type.replace('-', ' ')}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {scene.startTime}s - {scene.startTime + scene.duration}s
                        </span>
                      </div>
                      <p className="text-white text-sm">{scene.text}</p>
                      {scene.visualDirection && (
                        <p className="text-gray-400 text-xs mt-1 italic">
                          Visual: {scene.visualDirection}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;