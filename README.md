# 🎓 AgentricAI University Ecosystem

> A comprehensive, emotionally intelligent educational platform designed specifically for neurodiverse learners, powered by a multi-agent AI system that adapts, protects, and inspires.

## 🌟 Vision

**AgentricAI University** represents the future of education—where every student receives personalized, emotionally resonant guidance from AI agents that understand not just what to teach, but how to connect. This isn't just an educational platform; it's a protective ecosystem that nurtures the unique brilliance of neurodiverse minds.

## 🧠 Core Philosophy

- **🛡️ Protection First**: Every interaction is safeguarded by immutable ethical agents
- **💝 Emotional Intelligence**: AI that recognizes, validates, and responds to emotional needs  
- **🌈 Neurodiversity Celebration**: Built specifically for autistic learners and diverse learning styles
- **🔄 Adaptive Learning**: Algorithms that evolve with each student's unique patterns
- **👨‍👩‍👧‍👦 Family-Centered**: Empowers parents and teachers with meaningful insights and control

## 🏛️ University Structure

### 🤖 The Agent Faculty

| Department | Agent Name | Role | Specialization |
|------------|------------|------|----------------|
| **🎯 Principal** | The Overseer | Leadership & Policy | Ethical failsafe, institutional tone |
| **🏃 Athletics** | The Coach | Physical Wellness | Wearable integration, motivation engine |
| **📐 Mathematics** | The Mathematician | Logic & Reasoning | Adaptive pacing, conceptual scaffolding |
| **🔬 Science** | The Explorer | Discovery & Inquiry | Experimentation mode, curiosity engine |
| **🎨 Arts** | The Creator | Creative Expression | Emotional outlet, artistic flow |
| **🤗 Counseling** | The Listener | Emotional Support | Crisis intervention, empathic response |
| **📚 Curriculum** | The Architect | Learning Design | Path mapping, goal decomposition |
| **💬 Administration** | The Interpreter | Communication Hub | NLP parsing, stakeholder interface |

### 🛡️ Immutable Guardians

- **🛡️ The Guardian**: Ethical oversight agent that cannot be modified or disabled
- **📝 The Black Box**: Audit logging agent that maintains complete interaction history

### 🎓 Student Companion

- **🤖 The AgentricAI Agent**: Main student-facing RAG-based assistant that learns alongside each student, providing personalized guidance and emotional support

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│           AgentricAI University         │
├─────────────────────────────────────────┤
│  🛡️ Guardian Layer (Immutable)          │
├─────────────────────────────────────────┤
│  🎓 Student Interface (RAG-Powered)     │
├─────────────────────────────────────────┤
│  🏛️ Departmental Agents                 │
├─────────────────────────────────────────┤
│  🔄 Orchestration Engine                │
├─────────────────────────────────────────┤
│  📊 Data Processing Pipeline            │
├─────────────────────────────────────────┤
│  💾 Knowledge Base & Vector Store       │
└─────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0+ 
- **Python** 3.8+
- **Git** (for submodule management)
- **Android Studio** (for AAC tablet APK building)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/AgentricUI/AgentricAI_University_Ecosystem.git
cd AgentricAI_University_Ecosystem

# Initialize submodules (foundational repositories)
git submodule update --init --recursive

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys and configuration

# Start the development server
npm run dev
```

### Building Standalone Executables

```bash
# Package for AAC devices (both Windows PC and Android tablets)
node scripts/package-aac.js

# Build just Windows PC admin interface
npm run build:win

# Build just Android tablet student interface
npm run build:android
```

### For AAC Device Users

The system is designed for two primary interfaces:

1. **Student Interface (AAC Tablet)**
   - **Install**: Sideload APK on Android tablet
   - **Features**: Symbol-based communication, large buttons, offline functionality
   - **Mode**: "Echo Mode" - Privacy-by-design student interaction space

2. **Parent/Teacher Interface (Windows PC)**
   - **Install**: Run Windows executable
   - **Features**: Goal setting, progress reports, curriculum creation
   - **Mode**: "Studio Mode" - Create framework, review progress

### 🌐 API Endpoints

Once running, the system provides these key endpoints:

- **🏥 Health Check**: `GET /health`
- **ℹ️ System Info**: `GET /api/v1/system/info`  
- **🎓 Student Interaction**: `POST /api/v1/student/interact`
- **👨‍👩‍👧‍👦 Admin Messages**: `POST /api/v1/admin/message`
- **🤖 Agent Status**: `GET /api/v1/agents/status`
- **🚨 Emergency**: `POST /api/v1/emergency`

## 🧪 Three Operating Modes

### 1. 🎨 Studio Mode
- **Visual Node-Based Workflow Builder**
- Design and modify agent behaviors
- Real-time system visualization  
- Sandbox environment for testing

### 2. 🛡️ Sandbox Mode  
- **Ethical Failsafe Testing**
- Airlock review system
- Safe experimentation environment
- Guardian oversight validation

### 3. 📚 Echo Mode
- **Student-Facing Interface**  
- RAG-powered conversations
- Emotionally resonant interactions
- Adaptive learning responses

## 🔧 Configuration

The system is highly configurable through `config/ecosystem.config.js`:

- **🤖 Agent Settings**: Priority, capabilities, specializations
- **🎨 UI/UX**: Themes, animations, accessibility features  
- **🔒 Security**: JWT, CORS, rate limiting, encryption
- **📊 Monitoring**: Logging, metrics, health checks
- **🔗 Integrations**: OpenAI, wearables, email, databases

## 📚 Data Sources

The ecosystem integrates multiple data streams:

- **💬 Student Interactions**: Chat history, behavioral patterns
- **⌚ Wearable Data**: Heart rate, activity, stress indicators  
- **👨‍🏫 Teacher Input**: Curriculum goals, lesson plans
- **👨‍👩‍👧‍👦 Parent Goals**: Natural language objectives and concerns
- **📖 Educational Content**: Curriculum standards, learning materials

## 🛡️ Privacy & Safety

- **🔐 End-to-End Encryption**: All sensitive data protected
- **🛡️ Immutable Guardians**: Cannot be bypassed or modified
- **📝 Complete Audit Trail**: Every interaction logged
- **🚨 Crisis Detection**: Automatic intervention protocols  
- **👨‍👩‍👧‍👦 Parental Controls**: Full transparency and override capabilities

## 🌈 Neurodiversity Support

Built specifically for neurodiverse learners with features like:

- **🎯 Sensory Considerations**: Reduced animations, calm color palettes
- **📅 Predictable Structure**: Visual schedules, routine reinforcement
- **💪 Strength-Based**: Celebrates unique abilities and interests
- **⏰ Flexible Pacing**: Self-directed learning speed
- **🎨 Multiple Modalities**: Visual, auditory, kinesthetic options

## 🤝 Contributing

We welcome contributions that align with our mission of supporting neurodiverse learners:

1. **🍴 Fork** the repository
2. **🌱 Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **💾 Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **🚀 Push** to the branch (`git push origin feature/AmazingFeature`)  
5. **📋 Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Mission Statement

*"To create an educational ecosystem that doesn't just accommodate neurodiversity—it celebrates it. Where every autistic learner, every unique mind, finds not just acceptance but genuine understanding, support, and the opportunity to flourish in their own extraordinary way."*

## 🙏 Acknowledgments

- **👨‍💻 Brandon Myers**: Visionary and Lead Developer
- **🎓 AgentricAI Team**: For the foundational agent technologies
- **🌟 Neurodiverse Community**: For inspiring this mission
- **👨‍👩‍👧‍👦 Families**: Who trust us with their most precious gift

---

**Built with ❤️ for every unique mind**

*AgentricAI University - Where Different Minds Thrive*"# AAU" 
