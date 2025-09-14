const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const config = require('../../config/ecosystem.config.js');
const agentRegistry = require('../agents/registry.json');

/**
 * Central orchestration engine for the AgentricAI University ecosystem
 * Manages all agents, their interactions, and system-wide coordination
 */
class AgentOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.activeAgents = new Map();
    this.messageQueue = [];
    this.isInitialized = false;
    this.logger = this.setupLogger();
    
    // Initialize system components
    this.guardian = null;
    this.blackBox = null;
    this.studentAgent = null;
    
    // System state
    this.systemState = {
      status: 'initializing',
      lastHealthCheck: null,
      activeConnections: 0,
      totalInteractions: 0,
      emergencyMode: false
    };

    // Bind event handlers
    this.setupEventHandlers();
  }

  /**
   * Initialize the orchestrator and bootstrap all agents
   */
  async initialize() {
    try {
      this.logger.info('Initializing AgentricAI University Orchestrator');
      
      // Step 1: Initialize immutable agents first (critical for system integrity)
      await this.initializeImmutableAgents();
      
      // Step 2: Initialize departmental agents
      await this.initializeDepartmentalAgents();
      
      // Step 3: Initialize student-facing agent
      await this.initializeStudentAgent();
      
      // Step 4: Setup communication channels
      await this.setupCommunicationChannels();
      
      // Step 5: Start health monitoring
      this.startHealthMonitoring();
      
      this.isInitialized = true;
      this.systemState.status = 'operational';
      this.logger.info('Orchestrator successfully initialized');
      this.emit('system:ready');
      
    } catch (error) {
      this.logger.error('Failed to initialize orchestrator:', error);
      this.systemState.status = 'error';
      this.emit('system:error', error);
      throw error;
    }
  }

  /**
   * Initialize immutable agents (Guardian and Black Box)
   * These are critical system agents that cannot be modified or disabled
   */
  async initializeImmutableAgents() {
    try {
      // Initialize The Guardian
      const guardianConfig = agentRegistry.immutableAgents.guardian;
      this.guardian = await this.createAgent('guardian', guardianConfig);
      this.guardian.immutable = true;
      this.guardian.priority = 0; // Highest priority
      this.activeAgents.set('guardian', this.guardian);
      
      // Initialize The Black Box
      const blackBoxConfig = agentRegistry.immutableAgents.blackBox;
      this.blackBox = await this.createAgent('blackBox', blackBoxConfig);
      this.blackBox.immutable = true;
      this.blackBox.priority = 0; // Highest priority
      this.activeAgents.set('blackBox', this.blackBox);
      
      this.logger.info('Immutable agents initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize immutable agents:', error);
      throw error;
    }
  }

  /**
   * Initialize all departmental agents
   */
  async initializeDepartmentalAgents() {
    const departments = agentRegistry.departmentalAgents;
    
    for (const [departmentId, agentConfig] of Object.entries(departments)) {
      try {
        const agent = await this.createAgent(departmentId, agentConfig);
        this.activeAgents.set(departmentId, agent);
        this.logger.info(`Departmental agent '${agentConfig.name}' initialized`);
        
      } catch (error) {
        this.logger.error(`Failed to initialize ${departmentId} agent:`, error);
        // Continue with other agents even if one fails
      }
    }
  }

  /**
   * Initialize the main student-facing agent
   */
  async initializeStudentAgent() {
    try {
      const studentConfig = agentRegistry.studentFacingAgent.agentricAI;
      this.studentAgent = await this.createAgent('agentricAI', studentConfig);
      this.studentAgent.isStudentFacing = true;
      this.activeAgents.set('agentricAI', this.studentAgent);
      
      this.logger.info('Student-facing agent initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize student agent:', error);
      throw error;
    }
  }

  /**
   * Create an individual agent instance
   */
  async createAgent(agentId, config) {
    const agent = {
      id: config.id || `agent-${agentId}-${Date.now()}`,
      name: config.name,
      type: config.type,
      status: 'initializing',
      priority: config.priority || 5,
      capabilities: config.capabilities || [],
      specializations: config.specializations || {},
      metadata: {
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        interactions: 0,
        successRate: 1.0
      },
      
      // Agent methods
      processMessage: async (message) => {
        return await this.processAgentMessage(agent, message);
      },
      
      updateStatus: (status, metadata = {}) => {
        agent.status = status;
        agent.metadata.lastActive = new Date().toISOString();
        Object.assign(agent.metadata, metadata);
        this.emit('agent:statusUpdate', { agentId: agent.id, status, metadata });
      },
      
      sendMessage: async (targetAgentId, message) => {
        return await this.routeMessage(agent.id, targetAgentId, message);
      }
    };
    
    agent.status = 'active';
    this.agents.set(agentId, agent);
    
    return agent;
  }

  /**
   * Route messages between agents with ethical oversight
   */
  async routeMessage(fromAgentId, toAgentId, message) {
    try {
      // Create message envelope
      const messageEnvelope = {
        id: uuidv4(),
        from: fromAgentId,
        to: toAgentId,
        content: message,
        timestamp: new Date().toISOString(),
        priority: this.getMessagePriority(fromAgentId, toAgentId),
        metadata: {
          systemGenerated: false,
          ethicalReview: false,
          studentVisible: false
        }
      };
      
      // Guardian oversight for all messages
      if (this.guardian && fromAgentId !== 'guardian') {
        const reviewResult = await this.guardian.processMessage({
          type: 'ethical_review',
          data: messageEnvelope
        });
        
        if (!reviewResult.approved) {
          this.logger.warn(`Message blocked by Guardian: ${reviewResult.reason}`);
          return { success: false, reason: reviewResult.reason };
        }
        
        messageEnvelope.metadata.ethicalReview = true;
      }
      
      // Black Box logging
      if (this.blackBox) {
        await this.blackBox.processMessage({
          type: 'log_interaction',
          data: messageEnvelope
        });
      }
      
      // Deliver message to target agent
      const targetAgent = this.activeAgents.get(toAgentId);
      if (!targetAgent) {
        throw new Error(`Target agent '${toAgentId}' not found`);
      }
      
      const response = await targetAgent.processMessage(messageEnvelope);
      
      // Update interaction statistics
      this.systemState.totalInteractions++;
      
      return response;
      
    } catch (error) {
      this.logger.error('Message routing failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process student interactions through the appropriate agents
   */
  async processStudentInteraction(studentId, interaction) {
    try {
      // All student interactions must go through the student agent first
      const studentResponse = await this.studentAgent.processMessage({
        type: 'student_interaction',
        studentId,
        data: interaction,
        timestamp: new Date().toISOString()
      });
      
      // Counseling agent monitors all student interactions for emotional state
      if (this.activeAgents.has('counseling')) {
        const counselingAgent = this.activeAgents.get('counseling');
        await counselingAgent.processMessage({
          type: 'emotional_monitoring',
          studentId,
          interaction,
          response: studentResponse
        });
      }
      
      // Route to appropriate departmental agent if needed
      const department = this.determineDepartment(interaction);
      if (department && this.activeAgents.has(department)) {
        const departmentAgent = this.activeAgents.get(department);
        await departmentAgent.processMessage({
          type: 'departmental_query',
          studentId,
          data: interaction,
          studentResponse
        });
      }
      
      return studentResponse;
      
    } catch (error) {
      this.logger.error('Student interaction processing failed:', error);
      
      // Emergency fallback to counseling agent
      if (this.activeAgents.has('counseling')) {
        return await this.activeAgents.get('counseling').processMessage({
          type: 'emergency_response',
          studentId,
          error: error.message
        });
      }
      
      throw error;
    }
  }

  /**
   * Handle emergency situations with immediate guardian intervention
   */
  async handleEmergency(type, data) {
    this.logger.critical(`Emergency detected: ${type}`, data);
    this.systemState.emergencyMode = true;
    
    // Immediately activate guardian protocols
    if (this.guardian) {
      await this.guardian.processMessage({
        type: 'emergency_protocol',
        emergencyType: type,
        data,
        timestamp: new Date().toISOString()
      });
    }
    
    // Notify all relevant agents
    const emergencyMessage = {
      type: 'system_emergency',
      emergencyType: type,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Alert counseling agent
    if (this.activeAgents.has('counseling')) {
      await this.activeAgents.get('counseling').processMessage(emergencyMessage);
    }
    
    // Alert principal agent
    if (this.activeAgents.has('principal')) {
      await this.activeAgents.get('principal').processMessage(emergencyMessage);
    }
    
    this.emit('system:emergency', { type, data });
  }

  /**
   * Process administrative messages from parents/teachers
   */
  async processAdminMessage(source, message) {
    try {
      // Route through the admin/interpreter agent
      if (!this.activeAgents.has('admin')) {
        throw new Error('Administrative agent not available');
      }
      
      const adminAgent = this.activeAgents.get('admin');
      const response = await adminAgent.processMessage({
        type: 'admin_input',
        source, // 'parent' or 'teacher'
        data: message,
        timestamp: new Date().toISOString()
      });
      
      // If the message contains goals, route to curriculum agent
      if (response.containsGoals && this.activeAgents.has('curriculum')) {
        const curriculumAgent = this.activeAgents.get('curriculum');
        await curriculumAgent.processMessage({
          type: 'goal_processing',
          source,
          goals: response.extractedGoals,
          originalMessage: message
        });
      }
      
      return response;
      
    } catch (error) {
      this.logger.error('Admin message processing failed:', error);
      throw error;
    }
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    const health = {
      status: this.systemState.status,
      timestamp: new Date().toISOString(),
      agents: {
        total: this.agents.size,
        active: this.activeAgents.size,
        immutable: 2, // Guardian and Black Box
        departmental: Object.keys(agentRegistry.departmentalAgents).length
      },
      performance: {
        totalInteractions: this.systemState.totalInteractions,
        averageResponseTime: this.calculateAverageResponseTime(),
        uptime: process.uptime()
      },
      flags: {
        emergencyMode: this.systemState.emergencyMode,
        guardianActive: this.guardian?.status === 'active',
        blackBoxActive: this.blackBox?.status === 'active'
      }
    };
    
    return health;
  }

  // Helper methods
  setupLogger() {
    return winston.createLogger({
      level: config.monitoring.logging.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: config.monitoring.logging.file }),
        new winston.transports.Console()
      ]
    });
  }

  setupEventHandlers() {
    this.on('agent:statusUpdate', (data) => {
      this.logger.debug('Agent status update:', data);
    });
    
    this.on('system:emergency', (data) => {
      this.logger.critical('System emergency:', data);
    });
  }

  setupCommunicationChannels() {
    // WebSocket setup for real-time communication would go here
    this.logger.info('Communication channels established');
  }

  startHealthMonitoring() {
    setInterval(() => {
      this.systemState.lastHealthCheck = new Date().toISOString();
      this.emit('system:healthCheck', this.getSystemHealth());
    }, config.monitoring.health.interval);
  }

  getMessagePriority(fromAgentId, toAgentId) {
    const fromAgent = this.activeAgents.get(fromAgentId);
    const toAgent = this.activeAgents.get(toAgentId);
    
    if (!fromAgent || !toAgent) return 5; // Default priority
    
    // Emergency messages get highest priority
    if (fromAgentId === 'guardian' || toAgentId === 'guardian') return 1;
    if (fromAgentId === 'counseling' || toAgentId === 'counseling') return 2;
    
    return Math.min(fromAgent.priority, toAgent.priority);
  }

  determineDepartment(interaction) {
    // Simple keyword-based routing (would be more sophisticated in production)
    const content = interaction.content?.toLowerCase() || '';
    
    if (content.includes('math') || content.includes('calculation')) return 'math';
    if (content.includes('science') || content.includes('experiment')) return 'science';
    if (content.includes('art') || content.includes('creative')) return 'arts';
    if (content.includes('exercise') || content.includes('fitness')) return 'athletics';
    if (content.includes('sad') || content.includes('worried')) return 'counseling';
    
    return null; // Let student agent handle general queries
  }

  calculateAverageResponseTime() {
    // Placeholder - would calculate from actual metrics
    return 250; // ms
  }

  async processAgentMessage(agent, message) {
    // Placeholder for individual agent message processing
    // Each agent would have its own specialized logic
    agent.metadata.interactions++;
    return {
      success: true,
      response: `${agent.name} processed message: ${message.type}`,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = AgentOrchestrator;