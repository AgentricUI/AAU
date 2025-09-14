#!/usr/bin/env node

/**
 * Bootstrap script for AgentricAI University Ecosystem
 * Initializes the system, creates necessary directories, and validates configuration
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function bootstrap() {
  console.log('🎓 Bootstrapping AgentricAI University Ecosystem...\n');

  try {
    // Step 1: Create necessary directories
    console.log('📁 Creating system directories...');
    const directories = [
      'logs',
      'data/university',
      'data/temp',
      'secrets',
      'agent_memory',
      'execution_logs',
      'sandbox_results',
      'wearable_data'
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`   ✅ Created: ${dir}`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }
    }

    // Step 2: Copy environment file if it doesn't exist
    console.log('\n🔧 Setting up environment configuration...');
    try {
      await fs.access('.env');
      console.log('   ℹ️  .env file already exists');
    } catch (error) {
      await fs.copyFile('.env.example', '.env');
      console.log('   ✅ Created .env from template');
    }

    // Step 3: Initialize git submodules
    console.log('\n📦 Initializing git submodules...');
    try {
      const { stdout } = await execAsync('git submodule update --init --recursive');
      console.log('   ✅ Submodules initialized');
      if (stdout.trim()) {
        console.log('   ', stdout.trim());
      }
    } catch (error) {
      console.log('   ⚠️  Warning: Could not initialize submodules:', error.message);
    }

    // Step 4: Check Node.js and npm versions
    console.log('\n🔍 Checking system requirements...');
    try {
      const { stdout: nodeVersion } = await execAsync('node --version');
      const { stdout: npmVersion } = await execAsync('npm --version');
      
      console.log(`   ✅ Node.js: ${nodeVersion.trim()}`);
      console.log(`   ✅ npm: ${npmVersion.trim()}`);
    } catch (error) {
      console.log('   ❌ Error checking Node.js/npm:', error.message);
      throw error;
    }

    // Step 5: Create initial database schema placeholder
    console.log('\n💾 Setting up database structure...');
    const dbInitScript = `-- AgentricAI University Database Schema
-- This file will be populated with the full schema during development

PRAGMA foreign_keys = ON;

-- Core tables will be created here
-- Users, Students, Agents, Interactions, etc.

-- Initial system check
SELECT 'AgentricAI University Database Initialized' as status;
`;

    await fs.writeFile('data/university/init.sql', dbInitScript);
    console.log('   ✅ Database initialization script created');

    // Step 6: Create initial configuration validation
    console.log('\n⚙️  Validating configuration...');
    try {
      const config = require('../config/ecosystem.config.js');
      console.log(`   ✅ Configuration loaded successfully`);
      console.log(`   📊 Environment: ${config.app.environment}`);
      console.log(`   🔧 Version: ${config.app.version}`);
      console.log(`   🏃 Port: ${config.app.port}`);
    } catch (error) {
      console.log('   ❌ Configuration validation failed:', error.message);
      throw error;
    }

    // Step 7: Success message
    console.log('\n🎉 Bootstrap completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Edit .env file with your API keys');
    console.log('   2. Run "npm install" to install dependencies');
    console.log('   3. Run "pip install -r requirements.txt" for Python dependencies');
    console.log('   4. Run "npm run dev" to start the development server');
    console.log('\n🎓 AgentricAI University is ready to transform education!\n');

  } catch (error) {
    console.error('\n💥 Bootstrap failed:', error.message);
    process.exit(1);
  }
}

// Run bootstrap if this script is executed directly
if (require.main === module) {
  bootstrap();
}

module.exports = bootstrap;