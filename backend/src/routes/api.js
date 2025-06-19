const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const ProductScraper = require('../services/scraper');
const AIContentGenerator = require('../services/aiGenerator');
const VideoGenerator = require('../services/videoGenerator');

const router = express.Router();

// Initialize services
const scraper = new ProductScraper();
const aiGenerator = new AIContentGenerator();
const videoGenerator = new VideoGenerator();

// Middleware for request logging
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      scraper: 'ready',
      aiGenerator: 'ready',
      videoGenerator: VideoGenerator.checkFFmpegAvailability() ? 'ready' : 'ffmpeg-missing'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Scrape product data from URL
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validation
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid URL format' 
      });
    }

    console.log(`Scraping product from: ${url}`);
    
    // Set timeout for scraping
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Scraping timeout')), 30000);
    });

    const productData = await Promise.race([
      scraper.scrapeProduct(url),
      timeoutPromise
    ]);
    
    if (!productData.title) {
      return res.status(400).json({ 
        success: false,
        error: 'Could not extract product information from URL. Please try a different product page.' 
      });
    }

    // Log successful scraping
    console.log(`✅ Successfully scraped: ${productData.title}`);

    res.json({
      success: true,
      data: productData,
      metadata: {
        scrapedAt: new Date().toISOString(),
        processingTime: Date.now() - req.startTime
      }
    });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to scrape product data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate AI script for product
router.post('/generate-script', async (req, res) => {
  try {
    const { productData } = req.body;
    
    // Validation
    if (!productData || !productData.title) {
      return res.status(400).json({ 
        success: false,
        error: 'Product data with title is required' 
      });
    }

    console.log(`Generating script for: ${productData.title}`);
    
    // Set timeout for AI generation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI generation timeout')), 60000);
    });

    const script = await Promise.race([
      aiGenerator.generateVideoScript(productData),
      timeoutPromise
    ]);
    
    if (!aiGenerator.validateScript(script)) {
      throw new Error('Generated script validation failed');
    }

    console.log(`✅ Successfully generated script: ${script.title}`);

    res.json({
      success: true,
      data: script,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'lm-studio-local',
        processingTime: Date.now() - req.startTime
      }
    });

  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate script',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate alternative script
router.post('/generate-alternative-script', async (req, res) => {
  try {
    const { productData, previousScript } = req.body;
    
    // Validation
    if (!productData || !previousScript) {
      return res.status(400).json({ 
        success: false,
        error: 'Product data and previous script are required' 
      });
    }

    console.log(`Generating alternative script for: ${productData.title}`);

    const alternativeScript = await aiGenerator.generateAlternativeScript(productData, previousScript);
    
    if (!aiGenerator.validateScript(alternativeScript)) {
      throw new Error('Generated alternative script validation failed');
    }

    console.log(`✅ Successfully generated alternative script: ${alternativeScript.title}`);
    
    res.json({
      success: true,
      data: alternativeScript,
      metadata: {
        generatedAt: new Date().toISOString(),
        type: 'alternative',
        processingTime: Date.now() - req.startTime
      }
    });

  } catch (error) {
    console.error('Alternative script generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate alternative script',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate video from product data and script
router.post('/generate-video', async (req, res) => {
  try {
    const { productData, script } = req.body;
    
    // Validation
    if (!productData || !script) {
      return res.status(400).json({ 
        success: false,
        error: 'Product data and script are required' 
      });
    }

    if (!VideoGenerator.checkFFmpegAvailability()) {
      return res.status(500).json({ 
        success: false,
        error: 'FFmpeg is not available. Please install FFmpeg to generate videos.' 
      });
    }

    console.log(`Generating video for: ${productData.title}`);
    
    // Set a longer timeout for video generation
    req.setTimeout(300000); // 5 minutes
    
    const result = await videoGenerator.generateVideo(productData, script);
    
    // Get video file stats
    const videoStats = await fs.stat(result.videoPath);
    const videoUrl = `/videos/${path.basename(result.videoPath)}`;
    
    console.log(`✅ Successfully generated video: ${videoUrl}`);
    
    res.json({
      success: true,
      data: {
        videoId: result.videoId,
        videoUrl,
        duration: result.duration,
        fileSize: videoStats.size,
        metadata: {
          ...result.metadata,
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - req.startTime
        }
      }
    });

  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate video',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Complete pipeline: URL to Video
router.post('/create-video-ad', async (req, res) => {
  let streamingStarted = false;
  let completed = false;

  const startStreaming = () => {
    if (!streamingStarted && !res.headersSent) {
      streamingStarted = true;
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
    }
  };

  const writeData = (data) => {
    if (streamingStarted && !completed && res.writable) {
      res.write(JSON.stringify(data) + '\n');
    }
  };

  const endResponse = () => {
    if (streamingStarted && !completed && res.writable) {
      completed = true;
      res.end();
    }
  };

  const sendError = (statusCode, errorMessage) => {
    if (!res.headersSent && !completed) {
      return res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  };

  try {
    const { url } = req.body;
    
    // Validation
    if (!url) {
      return sendError(400, 'URL is required');
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return sendError(400, 'Invalid URL format');
    }

    if (!VideoGenerator.checkFFmpegAvailability()) {
      return sendError(500, 'FFmpeg is not available. Please install FFmpeg to generate videos.');
    }

    console.log(`Starting complete pipeline for: ${url}`);
    
    // Set longer timeout for complete pipeline
    req.setTimeout(600000); // 10 minutes
    
    // Start streaming response
    startStreaming();

    try {
      // Step 1: Scrape product data
      writeData({ 
        step: 'scraping', 
        message: 'Extracting product information...',
        progress: 10
      });

      const productData = await scraper.scrapeProduct(url);
      
      if (!productData.title) {
        throw new Error('Could not extract product information from URL');
      }

      console.log(`✅ Scraping complete: ${productData.title}`);
      
      if (productData.isDemo) {
        writeData({ 
          step: 'scraping', 
          message: 'Using demo product data (scraping protection detected)...',
          progress: 20
        });
      }

      // Step 2: Generate script
      writeData({ 
        step: 'script', 
        message: 'Generating video script with AI...',
        progress: 40
      });

      const script = await aiGenerator.generateVideoScript(productData);
      
      if (!aiGenerator.validateScript(script)) {
        throw new Error('Generated script validation failed');
      }

      console.log(`✅ Script generation complete: ${script.title}`);

      // Step 3: Generate video
      writeData({ 
        step: 'video', 
        message: 'Creating video advertisement...',
        progress: 70
      });

      const result = await videoGenerator.generateVideo(productData, script);
      
      // Get video file stats
      const videoStats = await fs.stat(result.videoPath);
      const videoUrl = `/videos/${path.basename(result.videoPath)}`;
      
      console.log(`✅ Video generation complete: ${videoUrl}`);

      // Step 4: Complete
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
            metadata: {
              ...result.metadata,
              completedAt: new Date().toISOString(),
              totalProcessingTime: Date.now() - (req.startTime || Date.now())
            }
          }
        }
      };

      writeData({ 
        step: 'complete', 
        result: finalResult,
        progress: 100
      });

      console.log(`🎉 Complete pipeline successful for: ${productData.title}`);

    } catch (error) {
      console.error('Pipeline error:', error);
      writeData({ 
        step: 'error', 
        error: error.message,
        progress: 0
      });
    } finally {
      endResponse();
    }

  } catch (error) {
    console.error('Complete pipeline error:', error);
    
    if (!streamingStarted && !completed) {
      sendError(500, 'Failed to create video advertisement');
    } else if (streamingStarted && !completed) {
      writeData({ 
        step: 'error', 
        error: 'Failed to create video advertisement',
        progress: 0
      });
      endResponse();
    }
  }
});

// Get list of generated videos
router.get('/videos', async (req, res) => {
  try {
    const outputDir = path.join(__dirname, '../../outputs');
    
    // Ensure directory exists
    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
      return res.json({
        success: true,
        data: []
      });
    }

    const files = await fs.readdir(outputDir);
    
    const videos = [];
    for (const file of files) {
      if (file.endsWith('.mp4')) {
        try {
          const filePath = path.join(outputDir, file);
          const stats = await fs.stat(filePath);
          
          videos.push({
            filename: file,
            url: `/videos/${file}`,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime
          });
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
          // Continue with other files
        }
      }
    }
    
    // Sort by creation date (newest first)
    videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: videos,
      metadata: {
        totalVideos: videos.length,
        totalSize: videos.reduce((sum, video) => sum + video.size, 0),
        retrievedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to list videos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get specific video metadata
router.get('/videos/:filename/metadata', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (security check)
    if (!filename.endsWith('.mp4') || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid filename' 
      });
    }

    const filePath = path.join(__dirname, '../../outputs', filename);
    
    try {
      const stats = await fs.stat(filePath);
      const videoInfo = await videoGenerator.getVideoInfo(filePath);
      
      res.json({
        success: true,
        data: {
          filename,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          videoInfo
        }
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ 
          success: false,
          error: 'Video not found' 
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error getting video metadata:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get video metadata',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a generated video
router.delete('/videos/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (security check)
    if (!filename.endsWith('.mp4') || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid filename' 
      });
    }

    const filePath = path.join(__dirname, '../../outputs', filename);
    
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ Deleted video: ${filename}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ 
          success: false,
          error: 'Video not found' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      message: 'Video deleted successfully',
      metadata: {
        deletedFile: filename,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete video',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Batch delete videos
router.delete('/videos', async (req, res) => {
  try {
    const { filenames } = req.body;
    
    if (!Array.isArray(filenames) || filenames.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Array of filenames is required' 
      });
    }

    const results = [];
    const outputDir = path.join(__dirname, '../../outputs');

    for (const filename of filenames) {
      // Validate each filename
      if (!filename.endsWith('.mp4') || filename.includes('..') || filename.includes('/')) {
        results.push({
          filename,
          success: false,
          error: 'Invalid filename'
        });
        continue;
      }

      try {
        const filePath = path.join(outputDir, filename);
        await fs.unlink(filePath);
        results.push({
          filename,
          success: true
        });
      } catch (error) {
        results.push({
          filename,
          success: false,
          error: error.code === 'ENOENT' ? 'File not found' : error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`🗑️ Batch delete: ${successCount}/${filenames.length} videos deleted`);

    res.json({
      success: true,
      message: `${successCount} of ${filenames.length} videos deleted`,
      results,
      metadata: {
        requestedCount: filenames.length,
        successCount,
        failureCount: filenames.length - successCount,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in batch delete:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to batch delete videos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const outputDir = path.join(__dirname, '../../outputs');
    const tempDir = path.join(__dirname, '../../temp');
    
    // Get video statistics
    let totalVideos = 0;
    let totalSize = 0;
    
    try {
      const files = await fs.readdir(outputDir);
      for (const file of files) {
        if (file.endsWith('.mp4')) {
          try {
            const stats = await fs.stat(path.join(outputDir, file));
            totalVideos++;
            totalSize += stats.size;
          } catch (error) {
            // Skip files that can't be accessed
          }
        }
      }
    } catch (error) {
      // Directory might not exist yet
    }

    // Get temp directory size
    let tempSize = 0;
    try {
      const tempFiles = await fs.readdir(tempDir);
      for (const file of tempFiles) {
        try {
          const stats = await fs.stat(path.join(tempDir, file));
          tempSize += stats.size;
        } catch (error) {
          // Skip files that can't be accessed
        }
      }
    } catch (error) {
      // Directory might not exist yet
    }

    res.json({
      success: true,
      data: {
        videos: {
          count: totalVideos,
          totalSize,
          averageSize: totalVideos > 0 ? Math.round(totalSize / totalVideos) : 0
        },
        storage: {
          outputDirectory: outputDir,
          tempDirectory: tempDir,
          tempSize
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        },
        services: {
          ffmpeg: VideoGenerator.checkFFmpegAvailability(),
          lmStudio: process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1'
        }
      },
      metadata: {
        retrievedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get system statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Middleware for adding processing time to requests
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Error handling middleware (should be last)
router.use((error, req, res, next) => {
  console.error('API Route Error:', error);
  
  if (res.headersSent) {
    return next(error);
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;