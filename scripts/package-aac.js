#!/usr/bin/env node

/**
 * AgentricAI University - AAC Device Packaging Script
 * 
 * Packages the application for:
 * 1. Windows PC (Electron + PKG for admin interface)
 * 2. Android Tablets (Capacitor for student AAC interface)
 * 
 * Optimized for AAC communication devices and neurodiverse learners
 */

const fs = require('fs').promises;
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class AACPackager {
  constructor() {
    this.packageInfo = require('../package.json');
    this.buildConfig = {
      version: this.packageInfo.version,
      timestamp: new Date().toISOString(),
      platforms: ['windows', 'android']
    };
  }

  async packageForAAC() {
    console.log('🎓 Starting AgentricAI University AAC Device Packaging...\n');
    console.log('📱 Target Platforms: Windows PC (Admin) + Android Tablets (Student)\n');

    try {
      // Step 1: Prepare build environment
      await this.prepareBuildEnvironment();
      
      // Step 2: Build mobile version for Android tablets
      await this.buildMobileForAndroid();
      
      // Step 3: Build Windows executable for admin interface
      await this.buildWindowsExecutable();
      
      // Step 4: Create deployment packages
      await this.createDeploymentPackages();
      
      // Step 5: Generate installation instructions
      await this.generateInstallationGuide();
      
      console.log('\n🎉 AAC Device packaging completed successfully!');
      console.log('📦 Packages available in: ./dist-aac/');
      
    } catch (error) {
      console.error('\n💥 Packaging failed:', error.message);
      process.exit(1);
    }
  }

  async prepareBuildEnvironment() {
    console.log('🔧 Preparing build environment...');
    
    // Create output directories
    const dirs = [
      'dist-aac',
      'dist-aac/android',
      'dist-aac/windows',
      'dist-aac/docs',
      'assets/icons'
    ];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
    }
    
    // Copy essential assets
    await this.copyAAC_Assets();
    
    console.log('   ✅ Build environment prepared');
  }

  async copyAAC_Assets() {
    // Create basic AAC-optimized assets if they don't exist
    const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="#87CEEB" rx="64"/>
      <circle cx="256" cy="200" r="80" fill="white"/>
      <path d="M256 300 L200 400 L312 400 Z" fill="white"/>
      <text x="256" y="450" text-anchor="middle" font-family="Arial" font-size="32" fill="white">AgentricAI</text>
    </svg>`;
    
    try {
      await fs.writeFile('assets/icons/icon.svg', iconSVG);
    } catch (error) {
      // Assets might already exist
    }
  }

  async buildMobileForAndroid() {
    console.log('📱 Building mobile version for Android AAC tablets...');
    
    try {
      // Build mobile assets
      console.log('   📦 Building mobile bundle...');
      await execAsync('npm run build:mobile');
      
      // Initialize Capacitor if needed
      try {
        await fs.access('android');
      } catch {
        console.log('   🔧 Initializing Capacitor for Android...');
        await execAsync('npx cap add android');
      }
      
      // Sync with Capacitor
      console.log('   🔄 Syncing with Capacitor...');
      await execAsync('npx cap sync android');
      
      // Build Android APK
      console.log('   🏗️  Building Android APK...');
      await execAsync('npx cap build android');
      
      // Copy APK to distribution folder
      try {
        await execAsync('copy android\\app\\build\\outputs\\apk\\debug\\app-debug.apk dist-aac\\android\\AgentricAI-University-Student.apk');
      } catch {
        // Try alternative path
        await execAsync('copy android\\app\\build\\outputs\\apk\\release\\app-release.apk dist-aac\\android\\AgentricAI-University-Student.apk');
      }
      
      console.log('   ✅ Android APK built successfully');
      
    } catch (error) {
      console.error('   ❌ Android build failed:', error.message);
      console.log('   ℹ️  Note: Android Studio and SDK required for APK building');
    }
  }

  async buildWindowsExecutable() {
    console.log('💻 Building Windows executable for PC admin interface...');
    
    try {
      // Build the Node.js backend as standalone executable
      console.log('   📦 Building Windows executable...');
      await execAsync('npm run build:win');
      
      // Also build Electron version for better desktop integration
      console.log('   🖥️  Building Electron desktop app...');
      await execAsync('npm run build:electron');
      
      console.log('   ✅ Windows executables built successfully');
      
    } catch (error) {
      console.error('   ❌ Windows build failed:', error.message);
      throw error;
    }
  }

  async createDeploymentPackages() {
    console.log('📦 Creating deployment packages...');
    
    // Create package manifest
    const packageManifest = {
      name: 'AgentricAI University',
      version: this.buildConfig.version,
      buildDate: this.buildConfig.timestamp,
      description: 'Educational ecosystem for neurodiverse learners',
      platforms: {
        android: {
          file: 'android/AgentricAI-University-Student.apk',
          description: 'Student interface for AAC devices (Android tablets)',
          requirements: [
            'Android 7.0 or higher',
            'Minimum 2GB RAM',
            'Touch screen support',
            'Network connectivity (for initial setup)'
          ]
        },
        windows: {
          file: 'windows/AgentricAI-University-Windows.exe',
          description: 'Admin interface for parents and teachers (Windows PC)',
          requirements: [
            'Windows 10 or higher',
            'Minimum 4GB RAM',
            'Network connectivity',
            'Administrative privileges (for installation)'
          ]
        }
      },
      installation: {
        android: [
          'Enable "Install from unknown sources" in Android settings',
          'Transfer APK file to tablet',
          'Tap APK file and follow installation prompts',
          'Grant required permissions for accessibility features'
        ],
        windows: [
          'Run AgentricAI-University-Windows.exe as Administrator',
          'Follow installation wizard',
          'Configure API keys in settings (if using cloud features)',
          'Create student profiles through admin interface'
        ]
      },
      aacOptimization: {
        features: [
          'Touch-friendly large button interface',
          'Symbol-based communication support',
          'Offline-first operation',
          'Sensory-friendly design with calm colors',
          'Voice output (text-to-speech) support',
          'Visual schedule and routine reinforcement'
        ]
      }
    };
    
    await fs.writeFile(
      'dist-aac/package-manifest.json',
      JSON.stringify(packageManifest, null, 2)
    );
    
    console.log('   ✅ Deployment packages created');
  }

  async generateInstallationGuide() {
    console.log('📋 Generating installation guide...');
    
    const installGuide = `# AgentricAI University - Installation Guide

## 🎓 Welcome to AgentricAI University

This educational ecosystem is specifically designed for **neurodiverse learners**, especially children with autism and communication needs who use AAC (Augmentative and Alternative Communication) devices.

## 📱 For AAC Devices (Android Tablets)

### Student Interface Installation

1. **Enable Unknown Sources**
   - Go to Settings > Security
   - Enable "Unknown Sources" or "Install Unknown Apps"

2. **Install the App**
   - Transfer \`AgentricAI-University-Student.apk\` to your tablet
   - Tap the APK file
   - Follow the installation prompts
   - Grant permissions for:
     - Storage (for offline learning data)
     - Camera (for visual learning activities)
     - Microphone (for speech interaction)
     - Accessibility Services (for AAC support)

3. **First Time Setup**
   - Launch the app
   - Follow the simple setup wizard
   - The app will work offline after initial setup

### 🌟 AAC-Optimized Features
- **Large, Touch-Friendly Buttons**: Designed for easy finger navigation
- **Symbol Communication**: Visual symbols alongside text
- **Offline Learning**: Core functionality works without internet
- **Calm Interface**: Sensory-friendly colors and reduced animations
- **Voice Output**: Text-to-speech for all interactions

## 💻 For Windows PC (Admin Interface)

### Parent/Teacher Installation

1. **Download and Run**
   - Download \`AgentricAI-University-Windows.exe\`
   - Right-click and "Run as Administrator"

2. **Complete Installation**
   - Follow the installation wizard
   - Choose installation directory
   - Create desktop shortcut if desired

3. **Configure Settings**
   - Launch the application
   - Set up student profiles
   - Configure learning goals
   - Connect to student devices (optional)

### 👨‍👩‍👧‍👦 Parent/Teacher Features
- **Goal Setting**: Natural language goal input
- **Progress Reports**: AI-generated summaries of student progress
- **Privacy Protection**: Student interactions remain private
- **Multi-Student Support**: Manage multiple learners
- **Curriculum Planning**: Adaptive learning path design

## 🔒 Privacy & Safety

### Echo Project Privacy Model
- **Student interactions are completely private** - only the AI sees them
- Parents/teachers receive AI-generated progress reports
- No student data is sent to external servers during learning
- All interaction data is encrypted and stored locally

### Ethical Safeguards
- Immutable Guardian agents protect student welfare
- Ethical failsafe protocols prevent misuse
- Complete audit trail for compliance
- Crisis detection and intervention protocols

## 🎯 Designed For

- **Non-verbal autistic children**
- **AAC device users**
- **Students with communication needs**
- **Neurodiverse learners of all types**
- **Students requiring sensory-friendly interfaces**

## 🆘 Support

For technical support or questions about AAC device compatibility:
- Email: support@agentricai.com
- Include device model and Android version
- Describe any accessibility needs

## 🌈 Mission

*"To create an educational ecosystem that doesn't just accommodate neurodiversity—it celebrates it. Where every unique mind finds not just acceptance but genuine understanding, support, and the opportunity to flourish."*

---

**Built with ❤️ for every unique mind**

*AgentricAI University - Where Different Minds Thrive*
`;

    await fs.writeFile('dist-aac/docs/INSTALLATION.md', installGuide);
    
    // Create a simple HTML version for easier reading
    const htmlGuide = installGuide
      .replace(/^# /gm, '<h1>')
      .replace(/^## /gm, '</h1>\n<h2>')
      .replace(/^### /gm, '</h2>\n<h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/^- /gm, '<li>')
      .replace(/^(\d+)\. /gm, '<ol><li>')
      + '</h3>';
    
    const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>AgentricAI University - Installation Guide</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; }
        h2 { color: #3498db; }
        h3 { color: #27ae60; }
        code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
        .aac-highlight { background: #e8f5e8; padding: 15px; border-left: 4px solid #27ae60; margin: 15px 0; }
    </style>
</head>
<body>
${htmlGuide}
</body>
</html>`;
    
    await fs.writeFile('dist-aac/docs/INSTALLATION.html', fullHTML);
    
    console.log('   ✅ Installation guide generated');
  }
}

// Run the packaging process
if (require.main === module) {
  const packager = new AACPackager();
  packager.packageForAAC().catch((error) => {
    console.error('Packaging failed:', error);
    process.exit(1);
  });
}

module.exports = AACPackager;