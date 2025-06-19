const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const ProductScraper = require('./src/services/scraper');
const AIContentGenerator = require('./src/services/aiGenerator');
const VideoGenerator = require('./src/services/videoGenerator');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve generated videos
app.use('/videos', express.static(path.join(__dirname, 'outputs')));

// Initialize services
const scraper = new ProductScraper();
const aiGenerator = new AIContentGenerator();
const videoGenerator = new VideoGenerator();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    ffmpeg: VideoGenerator.checkFFmpegAvailability()
  });
});

// Scrape product data from URL
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Scraping product from: ${url}`);
    const productData = await scraper.scrapeProduct(url);
    
    if (!productData.title) {
      return res.status(400).json({ error: 'Could not extract product information from URL' });
    }

    res.json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape product data',
      details: error.message 
    });
  }
});

// Generate AI script for product
app.post('/api/generate-script', async (req, res) => {
  try {
    const { productData } = req.body;
    
    if (!productData || !productData.title) {
      return res.status(400).json({ error: 'Product data is required' });
    }

    console.log(`Generating script for: ${productData.title}`);
    const script = await aiGenerator.generateVideoScript(productData);
    
    if (!aiGenerator.validateScript(script)) {
      throw new Error('Generated script validation failed');
    }

    res.json({
      success: true,
      data: script
    });

  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate script',
      details: error.message 
    });
  }
});

// Generate alternative script
app.post('/api/generate-alternative-script', async (req, res) => {
  try {
    const { productData, previousScript } = req.body;
    
    if (!productData || !previousScript) {
      return res.status(400).json({ error: 'Product data and previous script are required' });
    }

    const alternativeScript = await aiGenerator.generateAlternativeScript(productData, previousScript);
    
    res.json({
      success: true,
      data: alternativeScript
    });

  } catch (error) {
    console.error('Alternative script generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate alternative script',
      details: error.message 
    });
  }
});

// Generate video from product data and script
app.post('/api/generate-video', async (req, res) => {
  try {
    const { productData, script } = req.body;
    
    if (!productData || !script) {
      return res.status(400).json({ error: 'Product data and script are required' });
    }

    if (!VideoGenerator.checkFFmpegAvailability()) {
      return res.status(500).json({ error: 'FFmpeg is not available. Please install FFmpeg to generate videos.' });
    }

    console.log(`Generating video for: ${productData.title}`);
    
    // Set a longer timeout for video generation
    req.setTimeout(300000); // 5 minutes
    
    const result = await videoGenerator.generateVideo(productData, script);
    
    // Get video file stats
    const videoStats = await fs.stat(result.videoPath);
    const videoUrl = `/videos/${path.basename(result.videoPath)}`;
    
    res.json({
      success: true,
      data: {
        videoId: result.videoId,
        videoUrl,
        duration: result.duration,
        fileSize: videoStats.size,
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate video',
      details: error.message 
    });
  }
});

// Complete pipeline: URL to Video
app.post('/api/create-video-ad', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (!VideoGenerator.checkFFmpegAvailability()) {
      return res.status(500).json({ error: 'FFmpeg is not available. Please install FFmpeg to generate videos.' });
    }

    console.log(`Starting complete pipeline for: ${url}`);
    
    // Set longer timeout for complete pipeline
    req.setTimeout(600000); // 10 minutes
    
    // Step 1: Scrape product data
    res.write(JSON.stringify({ step: 'scraping', message: 'Extracting product information...' }) + '\n');
    const productData = await scraper.scrapeProduct(url);
    
    if (!productData.title) {
      throw new Error('Could not extract product information from URL');
    }

    // Step 2: Generate script
    res.write(JSON.stringify({ step: 'script', message: 'Generating video script...' }) + '\n');
    const script = await aiGenerator.generateVideoScript(productData);
    
    if (!aiGenerator.validateScript(script)) {
      throw new Error('Generated script validation failed');
    }

    // Step 3: Generate video
    res.write(JSON.stringify({ step: 'video', message: 'Creating video advertisement...' }) + '\n');
    const result = await videoGenerator.generateVideo(productData, script);
    
    // Get video file stats
    const videoStats = await fs.stat(result.videoPath);
    const videoUrl = `/videos/${path.basename(result.videoPath)}`;
    
    const finalResult = {
      success: true,
      data: {
        productData,
        script,
        video: {
          videoId: result.videoId,
          videoUrl,
          duration: result.duration,
          fileSize: videoStats.size,
          metadata: result.metadata
        }
      }
    };

    res.write(JSON.stringify({ step: 'complete', result: finalResult }) + '\n');
    res.end();

  } catch (error) {
    console.error('Complete pipeline error:', error);
    res.status(500).json({ 
      error: 'Failed to create video advertisement',
      details: error.message 
    });
  }
});

// Get list of generated videos
app.get('/api/videos', async (req, res) => {
  try {
    const outputDir = path.join(__dirname, 'outputs');
    const files = await fs.readdir(outputDir);
    
    const videos = [];
    for (const file of files) {
      if (file.endsWith('.mp4')) {
        const filePath = path.join(outputDir, file);
        const stats = await fs.stat(filePath);
        
        videos.push({
          filename: file,
          url: `/videos/${file}`,
          size: stats.size,
          createdAt: stats.birthtime
        });
      }
    }
    
    // Sort by creation date (newest first)
    videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: videos
    });

  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ 
      error: 'Failed to list videos',
      details: error.message 
    });
  }
});

// Delete a generated video
app.delete('/api/videos/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (security check)
    if (!filename.endsWith('.mp4') || filename.includes('..')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, 'outputs', filename);
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ 
      error: 'Failed to delete video',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await scraper.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await scraper.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎥 FFmpeg available: ${VideoGenerator.checkFFmpegAvailability()}`);
});

module.exports = app;