const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');

class VideoGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../../outputs');
    this.tempDir = path.join(__dirname, '../../temp');
    this.assetsDir = path.join(__dirname, '../../assets');
    this.init();
  }

  async init() {
    await this.ensureDir(this.outputDir);
    await this.ensureDir(this.tempDir);
    await this.ensureDir(this.assetsDir);
  }

  async ensureDir(dir) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async generateVideo(productData, script) {
    try {
      const videoId = `video_${Date.now()}`;
      const tempVideoDir = path.join(this.tempDir, videoId);
      await this.ensureDir(tempVideoDir);

      console.log(`🎬 Creating professional video for: ${productData.title}`);

      // Create high-quality product visuals
      const visuals = await this.createProductVisuals(productData, tempVideoDir);
      
      // Generate professional scenes using FFmpeg directly
      const scenes = await this.createProfessionalScenes(script, visuals, tempVideoDir, productData);
      
      // Combine scenes with smooth transitions
      const outputPath = await this.combineScenes(scenes, tempVideoDir);

      // Cleanup
      await this.cleanup(tempVideoDir);

      console.log(`✅ Professional video complete: ${outputPath}`);

      return {
        videoPath: outputPath,
        videoId,
        duration: script.totalDuration,
        metadata: {
          productTitle: productData.title,
          createdAt: new Date().toISOString(),
          script: script.title,
          quality: 'professional'
        }
      };
    } catch (error) {
      console.error('Video generation error:', error);
      throw new Error(`Failed to generate video: ${error.message}`);
    }
  }

  async createProductVisuals(productData, tempDir) {
    console.log('🎨 Creating professional product visuals...');
    
    const visuals = [];
    
    // Create 4 different professional visual styles
    const visualStyles = [
      { name: 'hero', colors: ['#667eea', '#764ba2'], text: productData.title },
      { name: 'feature', colors: ['#4facfe', '#00f2fe'], text: 'PREMIUM QUALITY' },
      { name: 'lifestyle', colors: ['#43e97b', '#38f9d7'], text: 'EXPERIENCE MORE' },
      { name: 'cta', colors: ['#fa709a', '#fee140'], text: 'GET YOURS NOW' }
    ];

    for (let i = 0; i < visualStyles.length; i++) {
      const style = visualStyles[i];
      const visualPath = await this.createModernVisual(style, tempDir, i, productData);
      visuals.push(visualPath);
    }

    console.log(`✅ Created ${visuals.length} professional visuals`);
    return visuals;
  }

  async createModernVisual(style, tempDir, index, productData) {
    const visualPath = path.join(tempDir, `visual_${style.name}.png`);
    
    // Create professional visuals with simpler, more reliable FFmpeg commands
    const [color1, color2] = style.colors;
    const text = this.cleanText(style.text);
    
    try {
      // Simple but professional approach - create solid background with text
      const command = `ffmpeg -f lavfi -i "color=size=1080x1920:color=${color1}" -vf "drawtext=text='${text}':fontfile=/System/Library/Fonts/Arial.ttf:fontsize=120:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:shadowcolor=black:shadowx=8:shadowy=8" -frames:v 1 -y "${visualPath}"`;
      
      execSync(command, { stdio: 'ignore' });
      console.log(`✅ Created ${style.name} visual successfully`);
      
    } catch (error) {
      console.warn(`Failed to create ${style.name} visual, creating ultra-simple version`);
      
      // Ultra-simple fallback - just solid color
      try {
        const simpleCommand = `ffmpeg -f lavfi -i "color=size=1080x1920:color=${color1}" -frames:v 1 -y "${visualPath}"`;
        execSync(simpleCommand, { stdio: 'ignore' });
      } catch (fallbackError) {
        console.error(`Even simple visual creation failed for ${style.name}:`, fallbackError.message);
        // Create a minimal file to prevent further errors
        await fs.writeFile(visualPath.replace('.png', '.txt'), `Visual for ${style.name}`);
        throw new Error(`Could not create visual for ${style.name}`);
      }
    }

    return visualPath;
  }

  async createProfessionalScenes(script, visuals, tempDir, productData) {
    console.log('🎭 Creating professional scenes...');
    
    const scenes = [];
    
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const visual = visuals[i % visuals.length];
      
      console.log(`🎬 Creating ${scene.type} scene...`);
      
      const sceneVideo = await this.createAnimatedScene(
        scene,
        visual,
        tempDir,
        i,
        productData
      );
      
      scenes.push(sceneVideo);
    }
    
    return scenes;
  }

  async createAnimatedScene(scene, visualPath, tempDir, sceneIndex, productData) {
    const sceneVideoPath = path.join(tempDir, `scene_${sceneIndex}.mp4`);
    const duration = scene.duration;
    const cleanText = this.cleanText(scene.text);
    
    // Use much simpler, more reliable approach
    try {
      // Simple but effective: static background with large, readable text
      const command = `ffmpeg -loop 1 -i "${visualPath}" -vf "scale=1080:1920,drawtext=text='${cleanText}':fontsize=100:fontcolor=white:x=(w-text_w)/2:y=h*0.7:box=1:boxcolor=black@0.8:boxborderw=20:shadowcolor=black:shadowx=6:shadowy=6" -t ${duration} -c:v libx264 -pix_fmt yuv420p -r 30 -y "${sceneVideoPath}"`;
      
      execSync(command, { stdio: 'ignore' });
      console.log(`✅ Created scene ${sceneIndex} successfully`);
      
    } catch (error) {
      console.warn(`Scene ${sceneIndex} creation failed, using ultra-simple approach`);
      
      // Ultra-simple fallback
      try {
        const simpleCommand = `ffmpeg -loop 1 -i "${visualPath}" -t ${duration} -c:v libx264 -pix_fmt yuv420p -y "${sceneVideoPath}"`;
        execSync(simpleCommand, { stdio: 'ignore' });
      } catch (fallbackError) {
        console.error(`Even simple scene creation failed:`, fallbackError.message);
        throw new Error(`Could not create scene ${sceneIndex}`);
      }
    }

    return sceneVideoPath;
  }

  getSceneConfig(sceneType) {
    const configs = {
      'hook': {
        animation: 'zoom',
        fontSize: 100,
        fontColor: 'white',
        boxColor: 'black@0.8',
        boxBorder: 20,
        yPosition: 'h*0.75'
      },
      'problem-solution': {
        animation: 'slide',
        fontSize: 80,
        fontColor: 'white',
        boxColor: 'black@0.7',
        boxBorder: 15,
        yPosition: 'h*0.6'
      },
      'product-showcase': {
        animation: 'zoom',
        fontSize: 90,
        fontColor: '#f1c40f',
        boxColor: 'black@0.8',
        boxBorder: 18,
        yPosition: 'h*0.2'
      },
      'call-to-action': {
        animation: 'zoom',
        fontSize: 110,
        fontColor: 'white',
        boxColor: '#e74c3c@0.9',
        boxBorder: 25,
        yPosition: 'h*0.15'
      }
    };

    return configs[sceneType] || configs['product-showcase'];
  }

  async createSimpleScene(scene, visualPath, outputPath) {
    const cleanText = this.cleanText(scene.text);
    const command = `ffmpeg -loop 1 -i "${visualPath}" -vf "drawtext=text='${cleanText}':fontsize=80:fontcolor=white:x=(w-text_w)/2:y=h*0.7:box=1:boxcolor=black@0.7:boxborderw=15:shadowcolor=black:shadowx=4:shadowy=4" -t ${scene.duration} -c:v libx264 -pix_fmt yuv420p -y "${outputPath}"`;
    execSync(command, { stdio: 'ignore' });
  }

  cleanText(text) {
    return text
      .replace(/['"]/g, '')
      .replace(/[:\[\]]/g, '')
      .replace(/[,;]/g, ' ')
      .replace(/\$/g, 'USD ')
      .replace(/%/g, ' percent')
      .replace(/[!?]/g, '')
      .replace(/\./g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 60);
  }

  async combineScenes(scenes, tempDir) {
    console.log('🎞️ Combining scenes with professional transitions...');
    
    const outputPath = path.join(this.outputDir, `professional_${Date.now()}.mp4`);
    
    if (scenes.length === 1) {
      await fs.copyFile(scenes[0], outputPath);
      return outputPath;
    }

    // Create concat file
    const concatFile = path.join(tempDir, 'scenes.txt');
    const concatContent = scenes.map(scene => `file '${scene}'`).join('\n');
    await fs.writeFile(concatFile, concatContent);

    // Combine with smooth transitions
    const command = `ffmpeg -f concat -safe 0 -i "${concatFile}" -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -movflags +faststart -y "${outputPath}"`;
    
    try {
      execSync(command, { stdio: 'ignore' });
    } catch (error) {
      console.warn('Professional concat failed, using alternative');
      // Alternative approach
      const inputs = scenes.map(scene => `-i "${scene}"`).join(' ');
      const filterComplex = scenes.map((_, i) => `[${i}:v]`).join('') + `concat=n=${scenes.length}:v=1:a=0[outv]`;
      const altCommand = `ffmpeg ${inputs} -filter_complex "${filterComplex}" -map "[outv]" -c:v libx264 -preset medium -crf 20 -y "${outputPath}"`;
      execSync(altCommand, { stdio: 'ignore' });
    }

    return outputPath;
  }

  async cleanup(tempDir) {
    try {
      const files = await fs.readdir(tempDir);
      for (const file of files) {
        await fs.unlink(path.join(tempDir, file));
      }
      await fs.rmdir(tempDir);
      console.log('🧹 Cleaned up temporary files');
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  async getVideoInfo(videoPath) {
    try {
      const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
      const output = execSync(command, { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (error) {
      console.error('Failed to get video info:', error);
      return null;
    }
  }

  static checkFFmpegAvailability() {
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      console.error('FFmpeg not found. Please install FFmpeg to use video generation.');
      return false;
    }
  }
}

module.exports = VideoGenerator;