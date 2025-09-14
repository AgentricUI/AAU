#!/usr/bin/env node

/**
 * AgentricAI University - Interactive Demo
 * Showcases the Echo Project and agent system without heavy dependencies
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Load our agent registry
const agentRegistry = require('./agents/university-registry.json');

class AgentricAIDemo {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupDemoData();
  }

  setupMiddleware() {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(morgan('combined'));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.static('public'));
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
  }

  setupDemoData() {
    // Demo student data
    this.demoStudent = {
      id: 'student-demo-001',
      name: 'Alex',
      age: 8,
      preferences: {
        communication: 'symbols',
        learningStyle: 'visual',
        interests: ['animals', 'space', 'art'],
        challenges: ['verbal-communication', 'social-interaction']
      },
      progress: {
        mathLevel: 2,
        readingLevel: 1,
        communicationSkills: 3,
        emotionalRegulation: 2
      }
    };

    // Demo agent interactions
    this.agentInteractions = [];
    
    // Demo parent/teacher goals
    this.parentGoals = [
      "Help Alex communicate their needs more effectively",
      "Improve Alex's math skills with visual learning",
      "Build confidence in social situations",
      "Develop emotional self-regulation techniques"
    ];
  }

  setupRoutes() {
    // Main demo page
    this.app.get('/', (req, res) => {
      res.send(this.generateDemoHTML());
    });

    // Student interface (Echo Mode demo)
    this.app.get('/student', (req, res) => {
      res.send(this.generateStudentInterfaceHTML());
    });

    // Admin interface demo
    this.app.get('/admin', (req, res) => {
      res.send(this.generateAdminInterfaceHTML());
    });

    // API endpoints for demo functionality
    this.app.get('/api/demo/agents', (req, res) => {
      res.json({
        success: true,
        agents: this.getAgentSummary(),
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/demo/student', (req, res) => {
      res.json({
        success: true,
        student: this.demoStudent,
        timestamp: new Date().toISOString()
      });
    });

    this.app.post('/api/demo/interact', (req, res) => {
      const { message, agentType = 'student' } = req.body;
      const interaction = this.simulateAgentInteraction(message, agentType);
      
      this.agentInteractions.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        input: message,
        response: interaction,
        agentType
      });

      res.json({
        success: true,
        response: interaction,
        timestamp: new Date().toISOString()
      });
    });

    this.app.get('/api/demo/health', (req, res) => {
      res.json({
        status: 'operational',
        service: 'AgentricAI University Demo',
        version: '1.0.0',
        agents: {
          total: Object.keys(agentRegistry.educationalFaculty).length,
          active: Object.keys(agentRegistry.educationalFaculty).length,
          immutable: Object.keys(agentRegistry.immutableGuardians).length
        },
        echo_project: {
          privacy_mode: true,
          student_interactions_private: true,
          adaptive_learning: true,
          offline_capable: true
        },
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).send(`
        <div style="font-family: system-ui; text-align: center; padding: 50px; background: #f8f9fa;">
          <h2>🎓 AgentricAI University Demo</h2>
          <p>Page not found. Try:</p>
          <a href="/">Main Demo</a> | 
          <a href="/student">Student Interface</a> | 
          <a href="/admin">Admin Interface</a>
        </div>
      `);
    });
  }

  getAgentSummary() {
    const summary = {
      coreCoordinator: agentRegistry.coreCoordinator,
      immutableGuardians: Object.keys(agentRegistry.immutableGuardians).map(key => ({
        id: key,
        name: agentRegistry.immutableGuardians[key].name,
        role: agentRegistry.immutableGuardians[key].role,
        status: agentRegistry.immutableGuardians[key].status,
        cannotBeModified: agentRegistry.immutableGuardians[key].cannotBeModified
      })),
      educationalFaculty: Object.keys(agentRegistry.educationalFaculty).map(key => ({
        id: key,
        name: agentRegistry.educationalFaculty[key].name,
        role: agentRegistry.educationalFaculty[key].role,
        status: agentRegistry.educationalFaculty[key].status,
        specializations: agentRegistry.educationalFaculty[key].specializations
      }))
    };
    return summary;
  }

  simulateAgentInteraction(message, agentType) {
    // Simulate different agent responses based on type
    const responses = {
      student: [
        "I understand you're working on that! Let's try a different approach with pictures.",
        "Great job! You're making wonderful progress. Would you like to try the next activity?",
        "I notice you might need a break. Would you like to do some calm breathing exercises?",
        "That's a fantastic question! Let me show you with some visual examples."
      ],
      tutor: [
        "Let me explain this concept step by step, adapting to your learning style.",
        "I can see you're grasping this well. Let's build on what you already know.",
        "Would you prefer to learn this through pictures, hands-on activities, or stories?",
        "This is challenging, and that's okay! Learning takes time and patience."
      ],
      counselor: [
        "I hear that you're feeling frustrated. Those feelings are completely valid.",
        "You're doing such a good job communicating with me. I'm proud of you.",
        "Sometimes big emotions can feel overwhelming. Let's work through this together.",
        "Your feelings matter, and I'm here to listen and support you."
      ],
      admin: [
        "I've processed your goals and created an adaptive learning plan for Alex.",
        "Based on the interaction data, Alex is showing progress in communication skills.",
        "The system has identified areas where Alex might benefit from additional support.",
        "Parent report generated: Alex engaged well with visual learning activities today."
      ]
    };

    const agentResponses = responses[agentType] || responses.student;
    const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
    
    return {
      agent: agentType,
      message: randomResponse,
      context: {
        emotionalTone: 'supportive',
        adaptiveElements: true,
        privacyPreserved: agentType === 'student',
        timeToRespond: Math.floor(Math.random() * 500) + 200 // ms
      }
    };
  }

  generateDemoHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎓 AgentricAI University - Demo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; 
            background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; color: white; margin-bottom: 40px; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .header p { font-size: 1.2rem; opacity: 0.9; }
        .demo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 30px; margin-bottom: 40px; }
        .demo-card { 
            background: white; 
            border-radius: 20px; 
            padding: 30px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .demo-card:hover { transform: translateY(-5px); box-shadow: 0 15px 40px rgba(0,0,0,0.15); }
        .demo-card h3 { color: #2c3e50; margin-bottom: 15px; font-size: 1.5rem; }
        .demo-card p { color: #666; line-height: 1.6; margin-bottom: 20px; }
        .demo-button { 
            background: #3498db; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            font-size: 1rem;
            cursor: pointer; 
            transition: background 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }
        .demo-button:hover { background: #2980b9; }
        .demo-button.primary { background: #27ae60; }
        .demo-button.primary:hover { background: #229954; }
        .echo-project { background: #e8f5e8; border-left: 4px solid #27ae60; padding: 30px; border-radius: 10px; margin: 30px 0; }
        .agent-status { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px; }
        .agent-item { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
        .agent-item.active { background: #d4edda; border: 2px solid #28a745; }
        .agent-item.immutable { background: #fff3cd; border: 2px solid #ffc107; }
        .status-indicator { width: 12px; height: 12px; border-radius: 50%; display: inline-block; margin-right: 8px; }
        .status-active { background: #28a745; }
        .status-protected { background: #ffc107; }
        .interactive-demo { background: white; border-radius: 15px; padding: 30px; margin-top: 30px; }
        .chat-container { border: 2px solid #e9ecef; border-radius: 10px; height: 300px; overflow-y: auto; padding: 20px; margin-bottom: 20px; }
        .chat-input { width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; }
        .chat-message { padding: 10px; margin-bottom: 10px; border-radius: 8px; }
        .chat-message.user { background: #3498db; color: white; text-align: right; }
        .chat-message.agent { background: #f8f9fa; border-left: 4px solid #27ae60; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 AgentricAI University</h1>
            <p>Educational Ecosystem for Neurodiverse Learners</p>
            <p><em>Privacy-by-Design • Echo Project Architecture • AAC Device Optimized</em></p>
        </div>

        <div class="echo-project">
            <h3>🔒 Echo Project Privacy Model</h3>
            <p><strong>Student interactions are completely private</strong> - only the AI sees them. Parents and teachers receive AI-generated progress reports without accessing direct student interactions. This revolutionary approach protects the student's right to a private, unobserved learning space while providing meaningful insights to caregivers.</p>
        </div>

        <div class="demo-grid">
            <div class="demo-card">
                <h3>🎓 Student Interface</h3>
                <p><strong>Echo Mode</strong> - The private student learning space with symbol-based communication, large touch-friendly buttons, and offline functionality. Designed specifically for AAC devices and neurodiverse learners.</p>
                <a href="/student" class="demo-button primary">Try Student Interface</a>
            </div>

            <div class="demo-card">
                <h3>👨‍👩‍👧‍👦 Parent/Teacher Interface</h3>
                <p><strong>Studio Mode</strong> - Set learning goals in natural language, review AI-generated progress reports, and manage curriculum without accessing private student interactions.</p>
                <a href="/admin" class="demo-button">Try Admin Interface</a>
            </div>

            <div class="demo-card">
                <h3>🤖 Agent Network</h3>
                <p>View the complete faculty of AI agents including The Guardian (ethical oversight), Echo Orchestrator (adaptive learning), and specialized educational agents.</p>
                <button onclick="loadAgentStatus()" class="demo-button">View Agent Status</button>
            </div>
        </div>

        <div class="interactive-demo">
            <h3>🎯 Interactive Demo - Chat with AgentricAI</h3>
            <p>Experience how different agents respond to student needs:</p>
            
            <div class="chat-container" id="chatContainer">
                <div class="chat-message agent">
                    <strong>AgentricAI:</strong> Hi! I'm here to help you learn in a way that works best for you. What would you like to explore today?
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <input type="text" class="chat-input" id="chatInput" placeholder="Type a message or question..." onkeypress="handleKeyPress(event)">
                <button onclick="sendMessage()" class="demo-button">Send</button>
            </div>
            
            <div style="margin-top: 15px;">
                <label>Agent Type: </label>
                <select id="agentType" style="padding: 8px; border-radius: 4px; border: 2px solid #e9ecef;">
                    <option value="student">Student Agent (Echo Mode)</option>
                    <option value="tutor">The Tutor</option>
                    <option value="counselor">The Counselor</option>
                    <option value="admin">Admin Interface</option>
                </select>
            </div>
        </div>

        <div id="agentStatusContainer"></div>
    </div>

    <script>
        async function loadAgentStatus() {
            try {
                const response = await fetch('/api/demo/agents');
                const data = await response.json();
                
                const container = document.getElementById('agentStatusContainer');
                container.innerHTML = \`
                    <div class="interactive-demo">
                        <h3>🛡️ Agent Network Status</h3>
                        <div class="agent-status">
                            \${data.agents.immutableGuardians.map(agent => \`
                                <div class="agent-item immutable">
                                    <span class="status-indicator status-protected"></span>
                                    <strong>\${agent.name}</strong><br>
                                    <small>\${agent.role}</small><br>
                                    <em>🔒 Immutable</em>
                                </div>
                            \`).join('')}
                            \${data.agents.educationalFaculty.map(agent => \`
                                <div class="agent-item active">
                                    <span class="status-indicator status-active"></span>
                                    <strong>\${agent.name}</strong><br>
                                    <small>\${agent.role}</small><br>
                                    <em>✅ Active</em>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                \`;
            } catch (error) {
                console.error('Error loading agent status:', error);
            }
        }

        async function sendMessage() {
            const input = document.getElementById('chatInput');
            const agentType = document.getElementById('agentType').value;
            const container = document.getElementById('chatContainer');
            
            if (!input.value.trim()) return;
            
            // Add user message
            container.innerHTML += \`
                <div class="chat-message user">
                    <strong>You:</strong> \${input.value}
                </div>
            \`;
            
            const message = input.value;
            input.value = '';
            
            try {
                const response = await fetch('/api/demo/interact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, agentType })
                });
                
                const data = await response.json();
                
                // Add agent response
                container.innerHTML += \`
                    <div class="chat-message agent">
                        <strong>\${data.response.agent.charAt(0).toUpperCase() + data.response.agent.slice(1)} Agent:</strong> 
                        \${data.response.message}
                        <br><small style="opacity: 0.7;">Response time: \${data.response.context.timeToRespond}ms • Privacy: \${data.response.context.privacyPreserved ? 'Protected' : 'Standard'}</small>
                    </div>
                \`;
                
                container.scrollTop = container.scrollHeight;
                
            } catch (error) {
                container.innerHTML += \`
                    <div class="chat-message agent" style="background: #f8d7da; border-left-color: #dc3545;">
                        <strong>System:</strong> Sorry, there was an error processing your message.
                    </div>
                \`;
            }
        }

        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
    </script>
</body>
</html>`;
  }

  generateStudentInterfaceHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎓 Student Learning - Echo Mode</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; 
            background: #87CEEB;
            min-height: 100vh;
            font-size: 1.5rem;
        }
        .student-container { padding: 20px; max-width: 1000px; margin: 0 auto; }
        .header { text-align: center; color: white; margin-bottom: 30px; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .big-button { 
            background: white; 
            border: 4px solid #27ae60; 
            border-radius: 20px; 
            padding: 40px; 
            margin: 15px;
            font-size: 1.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 120px;
        }
        .big-button:hover { 
            transform: scale(1.05); 
            box-shadow: 0 12px 30px rgba(0,0,0,0.2);
            background: #f0fff0;
        }
        .big-button:active { transform: scale(0.98); }
        .button-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .symbol { font-size: 3rem; margin-right: 20px; }
        .privacy-banner { 
            background: #28a745; 
            color: white; 
            padding: 15px; 
            text-align: center; 
            margin-bottom: 20px;
            border-radius: 10px;
            font-size: 1.2rem;
        }
        .activity-area { 
            background: white; 
            border-radius: 20px; 
            padding: 40px; 
            margin-top: 30px;
            min-height: 300px;
            display: none;
        }
        .activity-area.active { display: block; }
        .back-button { 
            background: #6c757d; 
            color: white; 
            border: none; 
            padding: 15px 30px; 
            border-radius: 10px; 
            font-size: 1.2rem;
            cursor: pointer;
            margin-bottom: 20px;
        }
        .back-button:hover { background: #5a6268; }
    </style>
</head>
<body>
    <div class="student-container">
        <div class="privacy-banner">
            🔒 Your learning space is completely private - only you and your AI friend can see this
        </div>
        
        <div class="header">
            <h1>🎓 Hello, Alex!</h1>
            <p>What would you like to do today?</p>
        </div>

        <div id="mainMenu" class="button-grid">
            <button class="big-button" onclick="openActivity('learn')">
                <span class="symbol">📚</span> Learn Something New
            </button>
            
            <button class="big-button" onclick="openActivity('communicate')">
                <span class="symbol">💬</span> Talk & Communicate
            </button>
            
            <button class="big-button" onclick="openActivity('create')">
                <span class="symbol">🎨</span> Create & Express
            </button>
            
            <button class="big-button" onclick="openActivity('play')">
                <span class="symbol">🎮</span> Learn Through Play
            </button>
            
            <button class="big-button" onclick="openActivity('calm')">
                <span class="symbol">🧘</span> Calm & Breathe
            </button>
            
            <button class="big-button" onclick="openActivity('schedule')">
                <span class="symbol">📅</span> My Daily Schedule
            </button>
        </div>

        <!-- Learning Activity -->
        <div id="learn" class="activity-area">
            <button class="back-button" onclick="goBack()">← Back</button>
            <h2>📚 Learning Time</h2>
            <p style="font-size: 1.3rem; margin-bottom: 30px;">Let's learn together! I'll adapt to how you like to learn best.</p>
            
            <div class="button-grid">
                <button class="big-button" onclick="startLesson('math')">
                    <span class="symbol">🔢</span> Numbers & Math
                </button>
                <button class="big-button" onclick="startLesson('reading')">
                    <span class="symbol">📖</span> Reading & Stories
                </button>
                <button class="big-button" onclick="startLesson('science')">
                    <span class="symbol">🔬</span> Explore & Discover
                </button>
            </div>
        </div>

        <!-- Communication Activity -->
        <div id="communicate" class="activity-area">
            <button class="back-button" onclick="goBack()">← Back</button>
            <h2>💬 Let's Communicate</h2>
            <p style="font-size: 1.3rem; margin-bottom: 30px;">Use symbols, words, or pictures to tell me what you're thinking!</p>
            
            <div class="button-grid">
                <button class="big-button" onclick="communicate('happy')">
                    <span class="symbol">😊</span> I'm Happy
                </button>
                <button class="big-button" onclick="communicate('need_help')">
                    <span class="symbol">🙋</span> I Need Help
                </button>
                <button class="big-button" onclick="communicate('break')">
                    <span class="symbol">⏸️</span> I Need a Break
                </button>
                <button class="big-button" onclick="communicate('more')">
                    <span class="symbol">➕</span> I Want More
                </button>
            </div>
        </div>

        <!-- Other activities would be similar... -->
        <div id="calm" class="activity-area">
            <button class="back-button" onclick="goBack()">← Back</button>
            <h2>🧘 Calm Space</h2>
            <p style="font-size: 1.3rem; margin-bottom: 30px;">Let's take some deep breaths and feel peaceful together.</p>
            
            <div style="text-align: center; padding: 50px;">
                <div style="width: 150px; height: 150px; border-radius: 50%; background: linear-gradient(45deg, #87CEEB, #98FB98); margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; font-size: 4rem;">
                    🌟
                </div>
                <p style="font-size: 1.5rem; color: #2c3e50;">Breathe in... and breathe out...</p>
                <button class="big-button" onclick="startBreathing()" style="margin-top: 30px;">
                    <span class="symbol">💨</span> Start Breathing Exercise
                </button>
            </div>
        </div>
    </div>

    <script>
        function openActivity(activityId) {
            // Hide main menu
            document.getElementById('mainMenu').style.display = 'none';
            
            // Hide all activities
            const activities = document.querySelectorAll('.activity-area');
            activities.forEach(activity => activity.classList.remove('active'));
            
            // Show selected activity
            document.getElementById(activityId).classList.add('active');
            
            // Log interaction (in real system, this would be private)
            console.log(\`Student opened activity: \${activityId}\`);
        }

        function goBack() {
            // Hide all activities
            const activities = document.querySelectorAll('.activity-area');
            activities.forEach(activity => activity.classList.remove('active'));
            
            // Show main menu
            document.getElementById('mainMenu').style.display = 'grid';
        }

        function startLesson(subject) {
            alert(\`Starting \${subject} lesson! In the real app, this would launch an adaptive learning experience tailored to your needs.\`);
        }

        function communicate(message) {
            const messages = {
                'happy': "I'm so glad you're feeling happy! That makes me happy too! 😊",
                'need_help': "I'm here to help you! What do you need help with? 🤗",
                'break': "That's perfectly okay! Let's take a break and do something calming. 😌",
                'more': "You want to do more? That's wonderful! What would you like to do more of? ⭐"
            };
            
            alert(\`AgentricAI: \${messages[message]}\`);
        }

        function startBreathing() {
            alert('In the real app, this would start a guided breathing exercise with gentle animations and sounds to help you feel calm and centered.');
        }

        // Simulate periodic emotional check-ins (in real system, this would be more sophisticated)
        setTimeout(() => {
            if (Math.random() > 0.7) {
                const checkIn = confirm('Hi Alex! I noticed you\\'ve been learning for a while. Are you feeling good? Click OK if you\\'re doing great, or Cancel if you need a break.');
                if (!checkIn) {
                    openActivity('calm');
                }
            }
        }, 30000);
    </script>
</body>
</html>`;
  }

  generateAdminInterfaceHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>👨‍👩‍👧‍👦 AgentricAI University - Admin Interface</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; 
            background: #f8f9fa;
            min-height: 100vh;
        }
        .admin-container { padding: 20px; max-width: 1400px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .header h1 { color: #2c3e50; margin-bottom: 10px; }
        .header p { color: #666; font-size: 1.1rem; }
        .privacy-notice { 
            background: #d4edda; 
            border: 2px solid #28a745; 
            border-radius: 10px; 
            padding: 20px; 
            margin-bottom: 30px;
            color: #155724;
        }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px; }
        .dashboard-card { 
            background: white; 
            border-radius: 15px; 
            padding: 30px; 
            box-shadow: 0 6px 20px rgba(0,0,0,0.1);
            border-left: 5px solid #3498db;
        }
        .dashboard-card h3 { color: #2c3e50; margin-bottom: 20px; font-size: 1.4rem; }
        .goal-input { width: 100%; padding: 15px; border: 2px solid #e9ecef; border-radius: 8px; font-size: 1rem; margin-bottom: 15px; }
        .goal-button { 
            background: #27ae60; 
            color: white; 
            border: none; 
            padding: 15px 25px; 
            border-radius: 8px; 
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        .goal-button:hover { background: #229954; }
        .progress-item { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin-bottom: 15px;
            border-left: 4px solid #28a745;
        }
        .progress-item h4 { color: #2c3e50; margin-bottom: 8px; }
        .progress-bar { 
            width: 100%; 
            height: 12px; 
            background: #e9ecef; 
            border-radius: 6px; 
            overflow: hidden;
            margin-bottom: 8px;
        }
        .progress-fill { 
            height: 100%; 
            background: #28a745; 
            transition: width 0.3s ease;
        }
        .ai-insight { 
            background: #e3f2fd; 
            border-left: 4px solid #2196f3; 
            padding: 15px; 
            margin-bottom: 15px;
            border-radius: 0 8px 8px 0;
        }
        .ai-insight strong { color: #1976d2; }
        .agent-list { list-style: none; }
        .agent-list li { 
            padding: 10px; 
            margin-bottom: 8px; 
            background: #f8f9fa; 
            border-radius: 6px;
            display: flex;
            align-items: center;
        }
        .status-dot { 
            width: 12px; 
            height: 12px; 
            border-radius: 50%; 
            margin-right: 12px;
        }
        .status-active { background: #28a745; }
        .status-protected { background: #ffc107; }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="header">
            <h1>👨‍👩‍👧‍👦 Admin Interface - Studio Mode</h1>
            <p>Parent and Teacher Dashboard for Alex's Learning Journey</p>
        </div>

        <div class="privacy-notice">
            <h3>🔒 Privacy Protection Active</h3>
            <p><strong>Alex's direct learning interactions remain completely private.</strong> You receive AI-generated progress summaries and insights without accessing their personal learning conversations. This protects Alex's right to a private learning space while keeping you informed of their progress.</p>
        </div>

        <div class="dashboard-grid">
            <!-- Goal Setting -->
            <div class="dashboard-card">
                <h3>🎯 Set Learning Goals</h3>
                <p style="margin-bottom: 20px; color: #666;">Describe your goals for Alex in natural language. The AI will create adaptive learning plans.</p>
                
                <textarea 
                    class="goal-input" 
                    id="goalInput"
                    placeholder="Example: Help Alex improve their communication skills using visual symbols and build confidence in math through hands-on activities..."
                    rows="4"
                ></textarea>
                <button class="goal-button" onclick="processGoal()">Submit Goal</button>
                
                <div id="goalResponse" style="margin-top: 20px;"></div>
            </div>

            <!-- Progress Reports -->
            <div class="dashboard-card">
                <h3>📊 AI-Generated Progress Report</h3>
                <p style="margin-bottom: 20px; color: #666;">Based on private learning interactions (student data remains protected)</p>
                
                <div class="progress-item">
                    <h4>Communication Skills</h4>
                    <div class="progress-bar"><div class="progress-fill" style="width: 75%;"></div></div>
                    <p><small>Alex is using symbols more confidently and expressing needs more clearly</small></p>
                </div>
                
                <div class="progress-item">
                    <h4>Math Understanding</h4>
                    <div class="progress-bar"><div class="progress-fill" style="width: 60%;"></div></div>
                    <p><small>Shows strong visual learning preference, excels with hands-on activities</small></p>
                </div>
                
                <div class="progress-item">
                    <h4>Emotional Regulation</h4>
                    <div class="progress-bar"><div class="progress-fill" style="width: 85%;"></div></div>
                    <p><small>Using calm-down strategies effectively, fewer overwhelm episodes</small></p>
                </div>

                <div class="ai-insight">
                    <strong>AI Insight:</strong> Alex responded particularly well to animal-themed math problems this week. Consider incorporating more nature-based learning activities.
                </div>
            </div>

            <!-- Agent Status -->
            <div class="dashboard-card">
                <h3>🤖 Educational Agent Network</h3>
                <p style="margin-bottom: 20px; color: #666;">Active agents supporting Alex's learning</p>
                
                <ul class="agent-list">
                    <li><span class="status-dot status-protected"></span> <strong>The Guardian</strong> - Ethical oversight and student protection</li>
                    <li><span class="status-dot status-active"></span> <strong>Echo Orchestrator</strong> - Adaptive learning coordination</li>
                    <li><span class="status-dot status-active"></span> <strong>The Tutor</strong> - Subject-specific teaching</li>
                    <li><span class="status-dot status-active"></span> <strong>The Counselor</strong> - Emotional support and wellness</li>
                    <li><span class="status-dot status-active"></span> <strong>The Apprentice</strong> - Learning companion</li>
                </ul>

                <div class="ai-insight">
                    <strong>System Status:</strong> All agents operational. No ethical concerns detected. Student privacy maintained at all times.
                </div>
            </div>

            <!-- Recent Activity Summary -->
            <div class="dashboard-card">
                <h3>📈 Recent Activity Summary</h3>
                <p style="margin-bottom: 20px; color: #666;">High-level overview (individual interactions remain private)</p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>Today:</strong> 45 minutes of engaged learning time<br>
                    <strong>Activities:</strong> Math with visual symbols, creative art expression, calm breathing exercises<br>
                    <strong>Mood:</strong> Generally positive, one brief break needed
                </div>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <strong>This Week:</strong> Consistent daily engagement<br>
                    <strong>Strengths:</strong> Visual learning, symbol communication, creative activities<br>
                    <strong>Areas for Support:</strong> Transitions between activities, math confidence
                </div>

                <div class="ai-insight">
                    <strong>Recommendation:</strong> Alex thrives with predictable routines and visual schedules. Consider adding more transition warnings between activities.
                </div>
            </div>
        </div>
    </div>

    <script>
        function processGoal() {
            const goalText = document.getElementById('goalInput').value;
            const responseDiv = document.getElementById('goalResponse');
            
            if (!goalText.trim()) {
                responseDiv.innerHTML = '<p style="color: #dc3545;">Please enter a goal first.</p>';
                return;
            }

            // Simulate AI processing
            responseDiv.innerHTML = '<div style="color: #666;">🤖 Processing your goal with AI...</div>';
            
            setTimeout(() => {
                responseDiv.innerHTML = \`
                    <div class="ai-insight">
                        <strong>✅ Goal Processed Successfully</strong><br>
                        Your goal: "\${goalText}"<br><br>
                        <strong>AI-Generated Learning Plan:</strong><br>
                        • Created visual symbol communication activities<br>
                        • Added hands-on math manipulatives to curriculum<br>
                        • Integrated confidence-building exercises<br>
                        • Set up progress tracking for communication milestones<br><br>
                        <em>The learning plan will be implemented gradually during Alex's private learning sessions.</em>
                    </div>
                \`;
            }, 2000);
        }

        // Simulate real-time updates
        setInterval(() => {
            const insights = [
                "Alex just completed a math activity with 95% accuracy!",
                "The Counselor agent noted Alex used a calm-down strategy independently.",
                "Alex spent 15 minutes in focused learning - great concentration!",
                "The Tutor adapted the lesson difficulty based on Alex's responses."
            ];
            
            if (Math.random() > 0.95) {
                const randomInsight = insights[Math.floor(Math.random() * insights.length)];
                // In a real app, this would show as a notification
                console.log("Real-time insight:", randomInsight);
            }
        }, 5000);
    </script>
</body>
</html>`;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`
🎓 AgentricAI University Demo Server Started!

📱 Access Points:
   🏠 Main Demo: http://localhost:${this.port}
   🎓 Student Interface (Echo Mode): http://localhost:${this.port}/student  
   👨‍👩‍👧‍👦 Admin Interface (Studio Mode): http://localhost:${this.port}/admin
   🔧 API Health Check: http://localhost:${this.port}/api/demo/health

🧠 Echo Project Features:
   ✅ Privacy-by-design architecture
   ✅ Agent network with immutable guardians  
   ✅ AAC device optimization simulation
   ✅ Adaptive learning demonstration
   ✅ Parent/teacher progress reports

🌟 This demo showcases the core concepts without requiring heavy AI dependencies.
   The full system would include OpenAI integration, vector databases, and 
   real-time biometric data processing for complete adaptive learning.
`);
    });
  }
}

// Check if required dependencies exist
try {
  require.resolve('express');
  console.log('✅ Dependencies available - starting demo server...');
  const demo = new AgentricAIDemo();
  demo.start();
} catch (error) {
  console.log(`
❌ Demo dependencies not found. Please install them first:

PowerShell -ExecutionPolicy Bypass -Command "npm install express cors helmet morgan compression dotenv uuid winston lodash moment --legacy-peer-deps"

Then run: node src/demo.js
`);
  process.exit(1);
}