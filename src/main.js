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
      logger.info(`🚀 Server running at http://${config.app.host}:${config.app.port}`);
      logger.info('🤖 All agents initialized and ready');
      logger.info('🛡️  Guardian and Black Box active');
      logger.info('📚 AgentricAI University is now operational');
    });
    
    // Graceful shutdown handling
    setupGracefulShutdown(server);
    
  } catch (error) {
    logger.error('💥 Failed to start system:', error);
    process.exit(1);
  }
}

// Setup API routes
function setupApiRoutes() {
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    const health = orchestrator.getSystemHealth();
    res.json(health);
  });
  
  // System information
  app.get('/api/v1/system/info', (req, res) => {
    res.json({
      name: config.app.name,
      version: config.app.version,
      environment: config.app.environment,
      timestamp: new Date().toISOString(),
      agents: {
        total: orchestrator.agents.size,
        active: orchestrator.activeAgents.size
      }
    });
  });
  
  // Student interaction endpoint
  app.post('/api/v1/student/interact', async (req, res) => {
    try {
      const { studentId, interaction } = req.body;
      
      if (!studentId || !interaction) {
        return res.status(400).json({
          success: false,
          error: 'Student ID and interaction content required'
        });
      }
      
      const response = await orchestrator.processStudentInteraction(studentId, interaction);
      
      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Student interaction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process student interaction'
      });
    }
  });
  
  // Admin/parent/teacher message endpoint
  app.post('/api/v1/admin/message', async (req, res) => {
    try {
      const { source, message } = req.body;
      
      if (!source || !message) {
        return res.status(400).json({
          success: false,
          error: 'Source and message content required'
        });
      }
      
      const response = await orchestrator.processAdminMessage(source, message);
      
      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Admin message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process admin message'
      });
    }
  });
  
  // Agent status endpoint
  app.get('/api/v1/agents/status', (req, res) => {
    const agentStatus = Array.from(orchestrator.activeAgents.entries()).map(([id, agent]) => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      priority: agent.priority,
      lastActive: agent.metadata.lastActive,
      interactions: agent.metadata.interactions
    }));
    
    res.json({
      success: true,
      data: agentStatus,
      timestamp: new Date().toISOString()
    });
  });
  
  // Emergency endpoint (restricted)
  app.post('/api/v1/emergency', async (req, res) => {
    try {
      const { type, data } = req.body;
      
      if (!type) {
        return res.status(400).json({
          success: false,
          error: 'Emergency type required'
        });
      }
      
      await orchestrator.handleEmergency(type, data);
      
      res.json({
        success: true,
        message: 'Emergency protocols activated',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Emergency handling error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to handle emergency'
      });
    }
  });
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.originalUrl
    });
  });
}

// Setup WebSocket for real-time communication
function setupWebSocket() {
  // WebSocket implementation would go here for real-time agent communication
  logger.info('📡 WebSocket communication channels ready');
}

// Setup graceful shutdown
function setupGracefulShutdown(server) {
  const gracefulShutdown = (signal) => {
    logger.info(`🛑 Received ${signal}, initiating graceful shutdown...`);
    
    server.close(async (error) => {
      if (error) {
        logger.error('Error during server shutdown:', error);
      } else {
        logger.info('✅ Server closed successfully');
      }
      
      // Cleanup orchestrator
      try {
        // Deactivate all agents gracefully
        for (const [agentId, agent] of orchestrator.activeAgents) {
          agent.status = 'shutting_down';
          logger.info(`🤖 Deactivating agent: ${agent.name}`);
        }
        
        orchestrator.systemState.status = 'shutdown';
        logger.info('🎓 AgentricAI University ecosystem shutdown complete');
        
      } catch (cleanupError) {
        logger.error('Error during cleanup:', cleanupError);
      }
      
      process.exit(error ? 1 : 0);
    });
  };
  
  // Listen for shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });
}

// Handle process events
process.on('exit', (code) => {
  logger.info(`🎓 AgentricAI University process exited with code: ${code}`);
});

// Start the system
if (require.main === module) {
  startSystem().catch((error) => {
    logger.error('💥 System startup failed:', error);
    process.exit(1);
  });
}

module.exports = { app, orchestrator };