import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 300000, // 5 minutes timeout for video generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The operation is taking longer than expected.');
    } else if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// API Methods
export const apiService = {
  // Health check
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  },

  // Scrape product data from URL
  async scrapeProduct(url) {
    try {
      if (!url) {
        throw new Error('URL is required');
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid URL format');
      }

      const response = await api.post('/scrape', { url });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to scrape product data');
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Generate AI script from product data
  async generateScript(productData) {
    try {
      if (!productData || !productData.title) {
        throw new Error('Product data is required');
      }

      const response = await api.post('/generate-script', { productData });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate script');
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Generate alternative script
  async generateAlternativeScript(productData, previousScript) {
    try {
      if (!productData || !previousScript) {
        throw new Error('Product data and previous script are required');
      }

      const response = await api.post('/generate-alternative-script', {
        productData,
        previousScript
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate alternative script');
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Generate video from product data and script
  async generateVideo(productData, script) {
    try {
      if (!productData || !script) {
        throw new Error('Product data and script are required');
      }

      const response = await api.post('/generate-video', {
        productData,
        script
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to generate video');
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Complete pipeline: URL to Video with streaming
  async createVideoAd(url, onProgress) {
    try {
      if (!url) {
        throw new Error('URL is required');
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new Error('Invalid URL format');
      }

      const response = await fetch(`${api.defaults.baseURL}/create-video-ad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create video ad');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finalResult = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.step && onProgress) {
              onProgress(data.step, data.message);
            }
            
            if (data.step === 'complete' && data.result) {
              finalResult = data.result.data;
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming response line:', line);
          }
        }
      }

      if (!finalResult) {
        throw new Error('No final result received from streaming response');
      }

      return finalResult;
    } catch (error) {
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to create video advertisement');
    }
  },

  // Get list of generated videos
  async getVideos() {
    try {
      const response = await api.get('/videos');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch videos');
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Delete a specific video
  async deleteVideo(filename) {
    try {
      if (!filename) {
        throw new Error('Filename is required');
      }

      const response = await api.delete(`/videos/${filename}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete video');
      }

      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Download video file
  async downloadVideo(videoUrl, filename) {
    try {
      const fullUrl = videoUrl.startsWith('http') 
        ? videoUrl 
        : `${api.defaults.baseURL.replace('/api', '')}${videoUrl}`;

      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error('Failed to download video');
      }

      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename || 'video-ad.mp4';
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }
};

// Utility functions
export const apiUtils = {
  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format duration
  formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  },

  // Validate URL for e-commerce sites
  validateProductUrl(url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.toLowerCase();
      
      // Check for common e-commerce patterns
      const ecommercePatterns = [
        'shopify',
        'amazon',
        'etsy',
        'bigcommerce',
        'woocommerce',
        'magento'
      ];
      
      const pathPatterns = [
        'product',
        'item',
        'shop',
        'store',
        'buy'
      ];
      
      const isDomainEcommerce = ecommercePatterns.some(pattern => 
        domain.includes(pattern)
      );
      
      const isPathEcommerce = pathPatterns.some(pattern => 
        urlObj.pathname.toLowerCase().includes(pattern)
      );
      
      return isDomainEcommerce || isPathEcommerce;
    } catch {
      return false;
    }
  },

  // Get video thumbnail URL
  getVideoThumbnail(videoUrl) {
    // For now, return a placeholder
    // In a real implementation, you might generate actual thumbnails
    return '/api/placeholder/300/200';
  },

  // Check if video URL is valid
  isValidVideoUrl(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname.endsWith('.mp4') || 
             urlObj.pathname.includes('/videos/');
    } catch {
      return false;
    }
  }
};

// Export default api instance for direct use
export default api;