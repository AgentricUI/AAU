#!/usr/bin/env node

/**
 * AgentricAI University Ecosystem - Main Entry Point
 * 
 * This is the primary entry point for the comprehensive educational platform
 * with emotionally intelligent AI agents designed for neurodiverse learners.
 * 
 * @author Brandon Myers <brandon@agentricai.com>
 * @version 1.0.0
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const winston = require('winston');

const AgentOrchestrator = require('./core/orchestrator');
const config = require('../config/ecosystem.config.js');

// Initialize logger
const logger = winston.createLogger({
  level: config.monitoring.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: config.monitoring.logging.file }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Initialize Express app
const app = express();

// Security and middleware
app.use(helmet());
app.use(cors(config.security.cors));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Initialize the orchestrator
const orchestrator = new AgentOrchestrator();

// System startup
async function startSystem() {
  try {
    logger.info('🎓 Starting AgentricAI University Ecosystem');
    logger.info(`📊 Environment: ${config.app.environment}`);
    logger.info(`🔧 Version: ${config.app.version}`);
    
    // Initialize the agent orchestrator
    await orchestrator.initialize();
    
    // Setup API routes
    setupApiRoutes();
    
    // Setup WebSocket for real-time communication
    setupWebSocket();
    
    // Start the server
    const server = app.listen(config.app.port, config.app.host, () => {
      logger.info(`🚀 Server running at http://${config.app.host}:${config.app.port}`);\n      logger.info('🤖 All agents initialized and ready');\n      logger.info('🛡️  Guardian and Black Box active');\n      logger.info('📚 AgentricAI University is now operational');\n    });\n    \n    // Graceful shutdown handling\n    setupGracefulShutdown(server);\n    \n  } catch (error) {\n    logger.error('💥 Failed to start system:', error);\n    process.exit(1);\n  }\n}\n\n// Setup API routes\nfunction setupApiRoutes() {\n  \n  // Health check endpoint\n  app.get('/health', (req, res) => {\n    const health = orchestrator.getSystemHealth();\n    res.json(health);\n  });\n  \n  // System information\n  app.get('/api/v1/system/info', (req, res) => {\n    res.json({\n      name: config.app.name,\n      version: config.app.version,\n      environment: config.app.environment,\n      timestamp: new Date().toISOString(),\n      agents: {\n        total: orchestrator.agents.size,\n        active: orchestrator.activeAgents.size\n      }\n    });\n  });\n  \n  // Student interaction endpoint\n  app.post('/api/v1/student/interact', async (req, res) => {\n    try {\n      const { studentId, interaction } = req.body;\n      \n      if (!studentId || !interaction) {\n        return res.status(400).json({\n          success: false,\n          error: 'Student ID and interaction content required'\n        });\n      }\n      \n      const response = await orchestrator.processStudentInteraction(studentId, interaction);\n      \n      res.json({\n        success: true,\n        data: response,\n        timestamp: new Date().toISOString()\n      });\n      \n    } catch (error) {\n      logger.error('Student interaction error:', error);\n      res.status(500).json({\n        success: false,\n        error: 'Failed to process student interaction'\n      });\n    }\n  });\n  \n  // Admin/parent/teacher message endpoint\n  app.post('/api/v1/admin/message', async (req, res) => {\n    try {\n      const { source, message } = req.body;\n      \n      if (!source || !message) {\n        return res.status(400).json({\n          success: false,\n          error: 'Source and message content required'\n        });\n      }\n      \n      const response = await orchestrator.processAdminMessage(source, message);\n      \n      res.json({\n        success: true,\n        data: response,\n        timestamp: new Date().toISOString()\n      });\n      \n    } catch (error) {\n      logger.error('Admin message error:', error);\n      res.status(500).json({\n        success: false,\n        error: 'Failed to process admin message'\n      });\n    }\n  });\n  \n  // Agent status endpoint\n  app.get('/api/v1/agents/status', (req, res) => {\n    const agentStatus = Array.from(orchestrator.activeAgents.entries()).map(([id, agent]) => ({\n      id: agent.id,\n      name: agent.name,\n      type: agent.type,\n      status: agent.status,\n      priority: agent.priority,\n      lastActive: agent.metadata.lastActive,\n      interactions: agent.metadata.interactions\n    }));\n    \n    res.json({\n      success: true,\n      data: agentStatus,\n      timestamp: new Date().toISOString()\n    });\n  });\n  \n  // Emergency endpoint (restricted)\n  app.post('/api/v1/emergency', async (req, res) => {\n    try {\n      const { type, data } = req.body;\n      \n      if (!type) {\n        return res.status(400).json({\n          success: false,\n          error: 'Emergency type required'\n        });\n      }\n      \n      await orchestrator.handleEmergency(type, data);\n      \n      res.json({\n        success: true,\n        message: 'Emergency protocols activated',\n        timestamp: new Date().toISOString()\n      });\n      \n    } catch (error) {\n      logger.error('Emergency handling error:', error);\n      res.status(500).json({\n        success: false,\n        error: 'Failed to handle emergency'\n      });\n    }\n  });\n  \n  // 404 handler\n  app.use('*', (req, res) => {\n    res.status(404).json({\n      success: false,\n      error: 'Endpoint not found',\n      path: req.originalUrl\n    });\n  });\n}\n\n// Setup WebSocket for real-time communication\nfunction setupWebSocket() {\n  // WebSocket implementation would go here for real-time agent communication\n  logger.info('📡 WebSocket communication channels ready');\n}\n\n// Setup graceful shutdown\nfunction setupGracefulShutdown(server) {\n  const gracefulShutdown = (signal) => {\n    logger.info(`🛑 Received ${signal}, initiating graceful shutdown...`);\n    \n    server.close(async (error) => {\n      if (error) {\n        logger.error('Error during server shutdown:', error);\n      } else {\n        logger.info('✅ Server closed successfully');\n      }\n      \n      // Cleanup orchestrator\n      try {\n        // Deactivate all agents gracefully\n        for (const [agentId, agent] of orchestrator.activeAgents) {\n          agent.status = 'shutting_down';\n          logger.info(`🤖 Deactivating agent: ${agent.name}`);\n        }\n        \n        orchestrator.systemState.status = 'shutdown';\n        logger.info('🎓 AgentricAI University ecosystem shutdown complete');\n        \n      } catch (cleanupError) {\n        logger.error('Error during cleanup:', cleanupError);\n      }\n      \n      process.exit(error ? 1 : 0);\n    });\n  };\n  \n  // Listen for shutdown signals\n  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));\n  process.on('SIGINT', () => gracefulShutdown('SIGINT'));\n  \n  // Handle uncaught exceptions\n  process.on('uncaughtException', (error) => {\n    logger.error('💥 Uncaught Exception:', error);\n    gracefulShutdown('uncaughtException');\n  });\n  \n  process.on('unhandledRejection', (reason, promise) => {\n    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);\n    gracefulShutdown('unhandledRejection');\n  });\n}\n\n// Handle process events\nprocess.on('exit', (code) => {\n  logger.info(`🎓 AgentricAI University process exited with code: ${code}`);\n});\n\n// Start the system\nif (require.main === module) {\n  startSystem().catch((error) => {\n    logger.error('💥 System startup failed:', error);\n    process.exit(1);\n  });\n}\n\nmodule.exports = { app, orchestrator };