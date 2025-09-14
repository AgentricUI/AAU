module.exports = {
  // Application Configuration
  app: {
    name: 'AgentricAI University Ecosystem',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    timezone: process.env.TZ || 'UTC',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // Agent Configuration
  agents: {
    registry: {
      path: './src/agents/registry.json',
      autoLoad: true,
      watchForChanges: true
    },
    departments: {
      principal: { 
        name: 'The Overseer', 
        priority: 1, 
        ethicalFailsafe: true,
        guardianMode: true 
      },
      athletics: { 
        name: 'The Coach', 
        priority: 3, 
        wearableIntegration: true,
        motivationEngine: true 
      },
      math: { 
        name: 'The Mathematician', 
        priority: 2, 
        adaptivePacing: true,
        logicReasoning: true 
      },
      science: { 
        name: 'The Explorer', 
        priority: 2, 
        experimentationMode: true,
        curiosityEngine: true 
      },
      arts: { 
        name: 'The Creator', 
        priority: 3, 
        emotionalExpression: true,
        creativeFlow: true 
      },
      counseling: { 
        name: 'The Listener', 
        priority: 1, 
        emotionalMonitoring: true,
        crisisIntervention: true 
      },
      curriculum: { 
        name: 'The Architect', 
        priority: 2, 
        pathMapping: true,
        goalDecomposition: true 
      },
      admin: { 
        name: 'The Interpreter', 
        priority: 2, 
        nlpParsing: true,
        parentTeacherInterface: true 
      }
    },
    modes: {
      studio: {
        enabled: true,
        nodeBasedWorkflow: true,
        visualBuilder: true,
        sandbox: true
      },
      echo: {
        enabled: true,
        studentFacing: true,
        ragIntegration: true,
        emotionalResonance: true
      },
      sandbox: {
        enabled: true,
        ethicalTesting: true,
        airlockReview: true,
        safeModeDefault: true
      }
    },
    immutable: {
      guardian: {
        name: 'The Guardian',
        role: 'ethical oversight',
        cannotBeModified: true,
        alwaysActive: true
      },
      blackBox: {
        name: 'The Black Box',
        role: 'audit trail',
        cannotBeModified: true,
        alwaysLogging: true
      }
    }
  },

  // Database Configuration
  database: {
    primary: {
      type: 'sqlite',
      path: process.env.DB_PATH || './data/university.db',
      options: {
        logging: process.env.DB_LOGGING === 'true',
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    },
    cache: {
      type: 'redis',
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      ttl: parseInt(process.env.CACHE_TTL) || 3600
    },
    vectorStore: {
      type: 'chroma',
      host: process.env.CHROMA_HOST || 'localhost',
      port: process.env.CHROMA_PORT || 8000,
      collection: 'agentricai_university'
    }
  },

  // RAG (Retrieval-Augmented Generation) Configuration
  rag: {
    embeddings: {
      model: process.env.EMBEDDING_MODEL || 'all-MiniLM-L6-v2',
      dimensions: 384,
      maxTokens: 512
    },
    retrieval: {
      topK: parseInt(process.env.RAG_TOP_K) || 5,
      scoreThreshold: parseFloat(process.env.RAG_SCORE_THRESHOLD) || 0.7,
      contextWindow: parseInt(process.env.RAG_CONTEXT_WINDOW) || 4000
    },
    generation: {
      provider: process.env.LLM_PROVIDER || 'openai',
      model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7,
      maxTokens: parseInt(process.env.LLM_MAX_TOKENS) || 2000
    }
  },

  // UI/UX Configuration
  ui: {
    theme: {
      mode: process.env.UI_THEME || 'adaptive', // light, dark, adaptive
      emotionalColors: {
        calm: '#87CEEB',
        excited: '#FFD700',
        focused: '#98FB98',
        stressed: '#F0E68C',
        confused: '#DDA0DD',
        confident: '#90EE90'
      },
      accessibility: {
        highContrast: true,
        largeText: true,
        reducedMotion: false,
        screenReader: true
      }
    },
    animations: {
      enabled: process.env.UI_ANIMATIONS !== 'false',
      duration: parseInt(process.env.UI_ANIMATION_DURATION) || 300,
      easing: 'ease-in-out'
    },
    nodeEditor: {
      enabled: true,
      gridSize: 20,
      snapToGrid: true,
      minimap: true
    }
  },

  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'change-this-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'AgentricAI University'
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // requests per window
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16
    }
  },

  // Monitoring and Analytics
  monitoring: {
    metrics: {
      enabled: process.env.METRICS_ENABLED === 'true',
      port: process.env.METRICS_PORT || 9090,
      endpoint: '/metrics'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json',
      file: process.env.LOG_FILE || './logs/ecosystem.log',
      maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      maxSize: process.env.LOG_MAX_SIZE || '10m'
    },
    health: {
      enabled: true,
      endpoint: '/health',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
    }
  },

  // External Integrations
  integrations: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000
    },
    wearables: {
      enabled: process.env.WEARABLES_ENABLED === 'true',
      supportedDevices: ['fitbit', 'apple_watch', 'garmin'],
      dataCollection: {
        heartRate: true,
        steps: true,
        sleep: true,
        stress: true
      }
    },
    email: {
      provider: process.env.EMAIL_PROVIDER || 'smtp',
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },

  // Educational Settings
  education: {
    gradeScales: {
      elementary: { min: 'K', max: '5' },
      middle: { min: '6', max: '8' },
      high: { min: '9', max: '12' }
    },
    subjects: [
      'mathematics', 'science', 'english', 'history', 
      'arts', 'physical_education', 'technology', 'life_skills'
    ],
    adaptiveLearning: {
      enabled: true,
      difficultyAdjustment: 'dynamic',
      pacingAlgorithm: 'student_centered',
      emotionalFactoring: true
    },
    neurodiverseSupport: {
      enabled: true,
      features: [
        'sensory_breaks',
        'visual_schedules',
        'social_stories',
        'choice_boards',
        'calm_down_strategies'
      ]
    }
  }
};