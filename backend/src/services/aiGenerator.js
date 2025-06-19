class AIContentGenerator {
  constructor() {
    // Local mode - no external dependencies
    this.mode = 'local';
    console.log('🤖 AI Content Generator initialized in LOCAL mode (no external APIs required)');
  }

  async generateVideoScript(productData) {
    try {
      console.log(`🎬 Generating local script for: ${productData.title}`);
      
      // Simulate AI processing time for realistic UX
      await this.simulateProcessingTime(2000, 4000);
      
      const script = this.createIntelligentScript(productData);
      
      if (!this.validateScript(script)) {
        throw new Error('Generated script validation failed');
      }

      console.log(`✅ Local script generated: ${script.title}`);
      return script;
      
    } catch (error) {
      console.error('Local script generation error:', error);
      return this.getFallbackScript(productData);
    }
  }

  async simulateProcessingTime(min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  createIntelligentScript(productData) {
    const { title, description, price, features } = productData;
    
    // Analyze product data to create contextual script
    const productType = this.detectProductType(title, description);
    const pricePoint = this.analyzePricePoint(price);
    const keyBenefits = this.extractKeyBenefits(description, features);
    const urgencyLevel = this.determineUrgencyLevel(productType, pricePoint);
    
    // Generate contextual scenes based on analysis
    const scenes = this.generateContextualScenes(
      productData, 
      productType, 
      pricePoint, 
      keyBenefits, 
      urgencyLevel
    );

    return {
      title: `${title} - Video Advertisement`,
      totalDuration: scenes.reduce((total, scene) => total + scene.duration, 0),
      scenes,
      voiceoverNotes: this.generateVoiceoverNotes(productType, urgencyLevel),
      backgroundMusic: this.selectBackgroundMusic(productType),
      metadata: {
        productType,
        pricePoint,
        urgencyLevel,
        generatedAt: new Date().toISOString(),
        generator: 'local-intelligent-template'
      }
    };
  }

  detectProductType(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    const categories = {
      fashion: ['clothing', 'shirt', 'dress', 'shoes', 'fashion', 'wear', 'style', 'outfit'],
      tech: ['phone', 'laptop', 'computer', 'device', 'gadget', 'electronic', 'smart', 'digital'],
      beauty: ['beauty', 'skincare', 'makeup', 'cosmetic', 'cream', 'serum', 'face', 'skin'],
      fitness: ['fitness', 'workout', 'gym', 'exercise', 'health', 'protein', 'muscle', 'training'],
      home: ['home', 'kitchen', 'furniture', 'decor', 'house', 'room', 'living', 'dining'],
      food: ['food', 'snack', 'drink', 'coffee', 'tea', 'organic', 'nutrition', 'flavor'],
      book: ['book', 'read', 'author', 'story', 'guide', 'learn', 'education', 'knowledge'],
      game: ['game', 'play', 'gaming', 'console', 'entertainment', 'fun', 'board']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  analyzePricePoint(price) {
    if (!price) return 'unknown';
    
    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    
    if (isNaN(numericPrice)) return 'unknown';
    if (numericPrice < 25) return 'budget';
    if (numericPrice < 100) return 'affordable';
    if (numericPrice < 500) return 'premium';
    return 'luxury';
  }

  extractKeyBenefits(description, features) {
    const benefits = [];
    const text = `${description} ${features.join(' ')}`.toLowerCase();
    
    const benefitKeywords = {
      'save time': ['quick', 'fast', 'instant', 'immediate', 'efficient', 'time-saving'],
      'save money': ['affordable', 'cheap', 'budget', 'value', 'deal', 'discount'],
      'premium quality': ['premium', 'quality', 'high-end', 'professional', 'luxury', 'best'],
      'easy to use': ['easy', 'simple', 'user-friendly', 'intuitive', 'effortless'],
      'durable': ['durable', 'lasting', 'strong', 'robust', 'reliable', 'long-lasting'],
      'innovative': ['innovative', 'new', 'advanced', 'cutting-edge', 'revolutionary'],
      'comfortable': ['comfortable', 'soft', 'cozy', 'ergonomic', 'smooth'],
      'versatile': ['versatile', 'flexible', 'multi-purpose', 'adaptable', 'various']
    };

    for (const [benefit, keywords] of Object.entries(benefitKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        benefits.push(benefit);
      }
    }

    return benefits.length > 0 ? benefits.slice(0, 3) : ['amazing quality', 'great value'];
  }

  determineUrgencyLevel(productType, pricePoint) {
    const urgencyFactors = {
      fashion: 2,
      tech: 1,
      beauty: 2,
      fitness: 1,
      budget: 2,
      affordable: 1,
      premium: 0,
      luxury: 0
    };

    const score = (urgencyFactors[productType] || 1) + (urgencyFactors[pricePoint] || 1);
    
    if (score >= 3) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  generateContextualScenes(productData, productType, pricePoint, benefits, urgencyLevel) {
    const { title, description, price } = productData;

    // Scene 1: Hook (3-5 seconds)
    const hookScene = {
      id: 1,
      startTime: 0,
      duration: 4,
      type: 'hook',
      text: this.generateHook(title, productType, urgencyLevel),
      visualDirection: 'Dynamic product hero shot with zoom effect',
      textAnimation: 'zoom-in'
    };

    // Scene 2: Problem/Solution (6-9 seconds)
    const problemSolutionScene = {
      id: 2,
      startTime: 4,
      duration: 8,
      type: 'problem-solution',
      text: this.generateProblemSolution(productType, benefits[0] || 'amazing benefits'),
      visualDirection: 'Split screen showing problem vs solution with product',
      textAnimation: 'slide-up'
    };

    // Scene 3: Product Showcase (6-8 seconds)
    const showcaseScene = {
      id: 3,
      startTime: 12,
      duration: 6,
      type: 'product-showcase',
      text: this.generateShowcase(title, benefits.slice(0, 2), pricePoint),
      visualDirection: 'Close-up product shots highlighting key features',
      textAnimation: 'fade-in'
    };

    // Scene 4: Call to Action (2-4 seconds)
    const ctaScene = {
      id: 4,
      startTime: 18,
      duration: 3,
      type: 'call-to-action',
      text: this.generateCTA(urgencyLevel, pricePoint, price),
      visualDirection: 'Strong CTA overlay with product logo and price',
      textAnimation: urgencyLevel === 'high' ? 'bounce' : 'fade-in'
    };

    return [hookScene, problemSolutionScene, showcaseScene, ctaScene];
  }

  generateHook(title, productType, urgencyLevel) {
    const hooks = {
      high: [
        `🔥 Discover ${title}!`,
        `⚡ Introducing ${title}`,
        `🚨 Don't Miss ${title}`,
        `✨ Finally! ${title}`,
        `🎯 The ${title} You Need`
      ],
      medium: [
        `✨ Meet ${title}`,
        `🌟 Presenting ${title}`,
        `💎 Experience ${title}`,
        `🎉 Discover ${title}`,
        `🔥 Try ${title}`
      ],
      low: [
        `Introducing ${title}`,
        `Meet the new ${title}`,
        `Discover ${title}`,
        `Experience ${title}`,
        `The perfect ${title}`
      ]
    };

    const hookOptions = hooks[urgencyLevel] || hooks.medium;
    return hookOptions[Math.floor(Math.random() * hookOptions.length)];
  }

  generateProblemSolution(productType, benefit) {
    const templates = {
      fashion: `Transform your style with ${benefit}. Look amazing every day!`,
      tech: `Upgrade your digital life with ${benefit}. Technology that works for you.`,
      beauty: `Reveal your natural beauty with ${benefit}. Feel confident and radiant.`,
      fitness: `Achieve your fitness goals with ${benefit}. Get stronger, feel better.`,
      home: `Transform your space with ${benefit}. Create the home you love.`,
      food: `Taste the difference with ${benefit}. Pure quality you can trust.`,
      general: `Experience the power of ${benefit}. Life made better.`
    };

    return templates[productType] || templates.general;
  }

  generateShowcase(title, benefits, pricePoint) {
    const benefitText = benefits.length > 0 ? benefits.join(' and ') : 'premium quality';
    
    const showcases = {
      luxury: `${title} delivers ${benefitText}. Uncompromising excellence.`,
      premium: `${title} combines ${benefitText}. Premium quality, exceptional value.`,
      affordable: `${title} offers ${benefitText}. Great quality, amazing price.`,
      budget: `${title} provides ${benefitText}. Quality that doesn't break the bank.`
    };

    return showcases[pricePoint] || showcases.affordable;
  }

  generateCTA(urgencyLevel, pricePoint, price) {
    const ctas = {
      high: [
        `Get Yours Now! ${price ? '💳' : '🛒'}`,
        `Order Today! ${price ? price : '📱'}`,
        `Don't Wait - Buy Now! ${price ? '⚡' : '🔥'}`,
        `Limited Time! ${price ? price : 'Order Now'} 🚨`
      ],
      medium: [
        `Shop Now! ${price ? price : '🛍️'}`,
        `Get Yours Today ${price ? '💰' : '📦'}`,
        `Order Now ${price ? price : '✨'}`,
        `Buy Today! ${price ? '💳' : '🎯'}`
      ],
      low: [
        `Learn More ${price ? price : '📖'}`,
        `Shop Collection ${price ? '🛍️' : '✨'}`,
        `Discover More ${price ? price : '🔍'}`,
        `Explore Now ${price ? '💎' : '🌟'}`
      ]
    };

    const ctaOptions = ctas[urgencyLevel] || ctas.medium;
    return ctaOptions[Math.floor(Math.random() * ctaOptions.length)];
  }

  generateVoiceoverNotes(productType, urgencyLevel) {
    const tones = {
      high: 'Energetic and urgent tone with clear pronunciation. Build excitement and urgency.',
      medium: 'Confident and persuasive tone. Emphasize benefits and value proposition.',
      low: 'Professional and trustworthy tone. Focus on quality and reliability.'
    };

    const typeNotes = {
      fashion: 'Stylish and trendy delivery. Appeal to fashion-conscious audience.',
      tech: 'Clear and precise delivery. Highlight innovation and functionality.',
      beauty: 'Warm and aspirational tone. Focus on transformation and confidence.',
      fitness: 'Motivational and energetic delivery. Inspire action and achievement.',
      luxury: 'Sophisticated and premium tone. Convey exclusivity and quality.'
    };

    return `${tones[urgencyLevel]} ${typeNotes[productType] || ''}`.trim();
  }

  selectBackgroundMusic(productType) {
    const musicStyles = {
      fashion: 'upbeat',
      tech: 'modern',
      beauty: 'inspirational',
      fitness: 'energetic',
      home: 'warm',
      food: 'comfortable',
      luxury: 'elegant',
      general: 'upbeat'
    };

    return musicStyles[productType] || 'upbeat';
  }

  async generateAlternativeScript(productData, previousScript) {
    try {
      console.log(`🔄 Generating alternative script for: ${productData.title}`);
      
      // Simulate processing time
      await this.simulateProcessingTime(1500, 3000);
      
      // Create alternative with different approach
      const alternativeScript = this.createAlternativeApproach(productData, previousScript);
      
      console.log(`✅ Alternative script generated: ${alternativeScript.title}`);
      return alternativeScript;
      
    } catch (error) {
      console.error('Alternative script generation error:', error);
      return this.getFallbackScript(productData);
    }
  }

  createAlternativeApproach(productData, previousScript) {
    // Analyze previous script approach
    const previousApproach = this.analyzeScriptApproach(previousScript);
    
    // Create opposite/different approach
    const newApproach = this.generateAlternativeApproach(previousApproach);
    
    // Generate script with new approach
    return this.createScriptWithApproach(productData, newApproach);
  }

  analyzeScriptApproach(script) {
    const text = script.scenes.map(s => s.text).join(' ').toLowerCase();
    
    return {
      urgency: text.includes('now') || text.includes('today') ? 'high' : 'low',
      style: text.includes('🔥') || text.includes('⚡') ? 'energetic' : 'calm',
      focus: text.includes('quality') ? 'quality' : text.includes('price') ? 'value' : 'benefits'
    };
  }

  generateAlternativeApproach(previousApproach) {
    return {
      urgency: previousApproach.urgency === 'high' ? 'low' : 'high',
      style: previousApproach.style === 'energetic' ? 'calm' : 'energetic',
      focus: previousApproach.focus === 'quality' ? 'value' : 
             previousApproach.focus === 'value' ? 'benefits' : 'quality'
    };
  }

  createScriptWithApproach(productData, approach) {
    const { title } = productData;
    
    // Generate scenes based on approach
    const scenes = [
      {
        id: 1,
        startTime: 0,
        duration: 4,
        type: 'hook',
        text: approach.style === 'energetic' ? 
          `🚀 Revolutionary ${title}!` : 
          `Introducing the refined ${title}`,
        visualDirection: 'Product showcase with smooth transitions',
        textAnimation: approach.style === 'energetic' ? 'bounce' : 'fade-in'
      },
      {
        id: 2,
        startTime: 4,
        duration: 8,
        type: 'problem-solution',
        text: approach.focus === 'quality' ?
          `Experience unmatched quality and craftsmanship.` :
          approach.focus === 'value' ?
          `Get premium results without the premium price.` :
          `Discover benefits that transform your daily routine.`,
        visualDirection: 'Feature highlights with elegant presentation',
        textAnimation: 'slide-up'
      },
      {
        id: 3,
        startTime: 12,
        duration: 6,
        type: 'product-showcase',
        text: `${title} - where innovation meets perfection. See the difference.`,
        visualDirection: 'Detailed product views with professional lighting',
        textAnimation: 'zoom-in'
      },
      {
        id: 4,
        startTime: 18,
        duration: 3,
        type: 'call-to-action',
        text: approach.urgency === 'high' ? 
          `Order now! Limited availability! 🔥` : 
          `Discover more about ${title} 🌟`,
        visualDirection: 'Clear call-to-action with contact information',
        textAnimation: approach.urgency === 'high' ? 'bounce' : 'fade-in'
      }
    ];

    return {
      title: `${title} - Alternative Video Ad`,
      totalDuration: 21,
      scenes,
      voiceoverNotes: approach.style === 'energetic' ? 
        'Dynamic and exciting delivery with emphasis on key points' :
        'Professional and trustworthy tone with clear articulation',
      backgroundMusic: approach.style === 'energetic' ? 'upbeat' : 'inspirational',
      metadata: {
        approach,
        generatedAt: new Date().toISOString(),
        generator: 'local-alternative-template'
      }
    };
  }

  getFallbackScript(productData = {}) {
    const title = productData.title || "Amazing Product";
    const features = productData.features || [];
    const mainFeature = features[0] || "premium quality";
    
    return {
      title: `${title} Video Ad`,
      totalDuration: 20,
      scenes: [
        {
          id: 1,
          startTime: 0,
          duration: 4,
          type: 'hook',
          text: `🔥 Introducing ${title}!`,
          visualDirection: 'Hero product image with dynamic zoom',
          textAnimation: 'zoom-in'
        },
        {
          id: 2,
          startTime: 4,
          duration: 8,
          type: 'problem-solution',
          text: `Transform your life with ${mainFeature} and innovative design.`,
          visualDirection: 'Product benefits showcase with smooth transitions',
          textAnimation: 'slide-up'
        },
        {
          id: 3,
          startTime: 12,
          duration: 6,
          type: 'product-showcase',
          text: `✨ Premium quality meets unbeatable value`,
          visualDirection: 'Close-up product shots highlighting key features',
          textAnimation: 'fade-in'
        },
        {
          id: 4,
          startTime: 18,
          duration: 2,
          type: 'call-to-action',
          text: 'Order Now! 📱',
          visualDirection: 'Strong CTA overlay with product logo',
          textAnimation: 'bounce'
        }
      ],
      voiceoverNotes: 'Upbeat, confident, and persuasive tone with clear pronunciation',
      backgroundMusic: 'upbeat',
      metadata: {
        generator: 'local-fallback-template',
        generatedAt: new Date().toISOString()
      }
    };
  }

  validateScript(script) {
    // Ensure script has required structure
    if (!script.scenes || script.scenes.length === 0) {
      return false;
    }

    // Check that all scenes have required properties
    return script.scenes.every(scene => 
      scene.text && 
      typeof scene.startTime === 'number' && 
      typeof scene.duration === 'number'
    );
  }
}

module.exports = AIContentGenerator;