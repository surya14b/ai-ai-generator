import React, { useState } from 'react';

const URLInput = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  const sampleUrls = [
    'https://shop.gymshark.com/products/vital-seamless-leggings-black',
    'https://www.allbirds.com/products/mens-tree-runners',
    'https://bluebottlecoffee.com/store/hayes-valley-espresso'
  ];

  const validateUrl = (inputUrl) => {
    try {
      const urlObj = new URL(inputUrl);
      const validDomains = ['shopify', 'amazon', 'etsy', 'bigcommerce'];
      const domain = urlObj.hostname.toLowerCase();
      
      // Check if it's a known e-commerce platform or has product-like path
      const isEcommerce = validDomains.some(d => domain.includes(d)) ||
                         urlObj.pathname.includes('product') ||
                         urlObj.pathname.includes('item') ||
                         urlObj.pathname.includes('shop');
      
      return isEcommerce;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    setIsValidUrl(validateUrl(inputUrl));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidUrl && !loading) {
      onSubmit(url);
    }
  };

  const handleSampleUrl = (sampleUrl) => {
    setUrl(sampleUrl);
    setIsValidUrl(true);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Enter Product URL
        </h2>
        <p className="text-gray-300">
          Paste a product page URL from Shopify, Amazon, or other e-commerce sites
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com/products/amazing-product"
            className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg"
            disabled={loading}
          />
          
          {/* URL Validation Indicator */}
          {url && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              {isValidUrl ? (
                <div className="text-green-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="text-red-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>

        {/* URL Validation Message */}
        {url && !isValidUrl && (
          <p className="text-yellow-300 text-sm">
            ⚠️ Please enter a valid product page URL from an e-commerce site
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValidUrl || loading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
            isValidUrl && !loading
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Creating Video Ad...
            </div>
          ) : (
            '🚀 Generate Video Ad'
          )}
        </button>
      </form>

      {/* Sample URLs */}
      <div className="mt-8">
        <p className="text-gray-300 text-sm mb-4 text-center">
          Or try one of these sample products:
        </p>
        <div className="space-y-2">
          {sampleUrls.map((sampleUrl, index) => (
            <button
              key={index}
              onClick={() => handleSampleUrl(sampleUrl)}
              disabled={loading}
              className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sampleUrl}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="text-white font-semibold mb-2">Smart Scraping</h3>
          <p className="text-gray-300 text-sm">
            Automatically extracts product images, descriptions, and key features
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">🤖</div>
          <h3 className="text-white font-semibold mb-2">AI Script Generation</h3>
          <p className="text-gray-300 text-sm">
            Creates compelling ad copy optimized for conversions
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-2">🎬</div>
          <h3 className="text-white font-semibold mb-2">Professional Videos</h3>
          <p className="text-gray-300 text-sm">
            Generates high-quality 15-30 second video advertisements
          </p>
        </div>
      </div>
    </div>
  );
};

export default URLInput;