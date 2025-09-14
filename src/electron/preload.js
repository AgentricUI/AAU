const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Dialog methods
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Student interface methods
  onToggleCalmColors: (callback) => {
    ipcRenderer.on('toggle-calm-colors', callback);
  },
  onToggleLargeText: (callback) => {
    ipcRenderer.on('toggle-large-text', callback);
  },
  onEmergencyContact: (callback) => {
    ipcRenderer.on('emergency-contact', callback);
  },
  
  // Admin interface methods
  onShowAgentStatus: (callback) => {
    ipcRenderer.on('show-agent-status', callback);
  },
  
  // Data export
  exportData: (data) => ipcRenderer.send('export-data', data),
  
  // Clean up listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// AAC-specific API for communication devices
contextBridge.exposeInMainWorld('aacAPI', {
  // Symbol communication
  sendSymbolMessage: (symbols) => {
    return ipcRenderer.invoke('process-symbol-message', symbols);
  },
  
  // Voice output (text-to-speech)
  speak: (text, options = {}) => {
    return ipcRenderer.invoke('speak-text', text, options);
  },
  
  // Touch gestures
  onTouchGesture: (callback) => {
    ipcRenderer.on('touch-gesture', callback);
  },
  
  // Accessibility features
  setHighContrast: (enabled) => {
    ipcRenderer.send('set-high-contrast', enabled);
  },
  
  setLargeText: (enabled) => {
    ipcRenderer.send('set-large-text', enabled);
  },
  
  setReducedMotion: (enabled) => {
    ipcRenderer.send('set-reduced-motion', enabled);
  },
  
  // Emergency features for AAC devices
  emergencyAlert: (type) => {
    ipcRenderer.send('emergency-alert', type);
  },
  
  // Offline status
  onOfflineStatusChanged: (callback) => {
    ipcRenderer.on('offline-status-changed', callback);
  },
  
  // Data sync for AAC devices
  syncData: () => {
    return ipcRenderer.invoke('sync-data');
  },
  
  // Device-specific settings
  getDeviceSettings: () => {
    return ipcRenderer.invoke('get-device-settings');
  },
  
  updateDeviceSettings: (settings) => {
    return ipcRenderer.invoke('update-device-settings', settings);
  }
});

// Educational API
contextBridge.exposeInMainWorld('educationAPI', {
  // Student progress
  getStudentProgress: (studentId) => {
    return ipcRenderer.invoke('get-student-progress', studentId);
  },
  
  updateStudentProgress: (studentId, progress) => {
    return ipcRenderer.invoke('update-student-progress', studentId, progress);
  },
  
  // Learning interactions
  logLearningInteraction: (interaction) => {
    return ipcRenderer.invoke('log-learning-interaction', interaction);
  },
  
  // Agent communication
  sendMessageToAgent: (agentId, message) => {
    return ipcRenderer.invoke('send-message-to-agent', agentId, message);
  },
  
  // Emotional state monitoring
  reportEmotionalState: (state) => {
    ipcRenderer.send('report-emotional-state', state);
  },
  
  onEmotionalStateChange: (callback) => {
    ipcRenderer.on('emotional-state-change', callback);
  },
  
  // Curriculum management
  getCurrentCurriculum: () => {
    return ipcRenderer.invoke('get-current-curriculum');
  },
  
  updateCurriculum: (curriculumData) => {
    return ipcRenderer.invoke('update-curriculum', curriculumData);
  }
});

// Wearable integration API
contextBridge.exposeInMainWorld('wearableAPI', {
  // Connect to wearable devices
  connectWearable: (deviceType) => {
    return ipcRenderer.invoke('connect-wearable', deviceType);
  },
  
  // Get biometric data
  getBiometricData: () => {
    return ipcRenderer.invoke('get-biometric-data');
  },
  
  // Listen for real-time biometric updates
  onBiometricUpdate: (callback) => {
    ipcRenderer.on('biometric-update', callback);
  },
  
  // Stress detection
  onStressDetected: (callback) => {
    ipcRenderer.on('stress-detected', callback);
  },
  
  // Activity monitoring
  onActivityChange: (callback) => {
    ipcRenderer.on('activity-change', callback);
  },
  
  // Disconnect wearable
  disconnectWearable: () => {
    return ipcRenderer.invoke('disconnect-wearable');
  }
});

// Security and monitoring
contextBridge.exposeInMainWorld('securityAPI', {
  // Guardian status
  getGuardianStatus: () => {
    return ipcRenderer.invoke('get-guardian-status');
  },
  
  // Report security concern
  reportSecurityConcern: (concern) => {
    ipcRenderer.send('report-security-concern', concern);
  },
  
  // Audit log
  getAuditLog: (filters) => {
    return ipcRenderer.invoke('get-audit-log', filters);
  },
  
  // System health
  getSystemHealth: () => {
    return ipcRenderer.invoke('get-system-health');
  }
});

// Parent/Teacher admin API (restricted to admin window)
if (window.location.pathname.includes('/admin')) {
  contextBridge.exposeInMainWorld('adminAPI', {
    // Student management
    getAllStudents: () => {
      return ipcRenderer.invoke('get-all-students');
    },
    
    addStudent: (studentData) => {
      return ipcRenderer.invoke('add-student', studentData);
    },
    
    updateStudent: (studentId, updates) => {
      return ipcRenderer.invoke('update-student', studentId, updates);
    },
    
    // Goal management
    setStudentGoals: (studentId, goals) => {
      return ipcRenderer.invoke('set-student-goals', studentId, goals);
    },
    
    getStudentGoals: (studentId) => {
      return ipcRenderer.invoke('get-student-goals', studentId);
    },
    
    // Reports and analytics
    generateProgressReport: (studentId, dateRange) => {
      return ipcRenderer.invoke('generate-progress-report', studentId, dateRange);
    },
    
    getAnalytics: (filters) => {
      return ipcRenderer.invoke('get-analytics', filters);
    },
    
    // Agent management
    getAgentStatus: () => {
      return ipcRenderer.invoke('get-agent-status');
    },
    
    configureAgent: (agentId, config) => {
      return ipcRenderer.invoke('configure-agent', agentId, config);
    },
    
    // System configuration
    getSystemConfig: () => {
      return ipcRenderer.invoke('get-system-config');
    },
    
    updateSystemConfig: (config) => {
      return ipcRenderer.invoke('update-system-config', config);
    },
    
    // Emergency management
    initiateEmergencyProtocol: (type, details) => {
      return ipcRenderer.invoke('initiate-emergency-protocol', type, details);
    },
    
    // Data management
    exportStudentData: (studentId, options) => {
      return ipcRenderer.invoke('export-student-data', studentId, options);
    },
    
    importCurriculumData: (data) => {
      return ipcRenderer.invoke('import-curriculum-data', data);
    }
  });
}

// Utility functions
contextBridge.exposeInMainWorld('utils', {
  // Date and time utilities
  formatDate: (date, format) => {
    // Simple date formatting utility
    const d = new Date(date);
    switch (format) {
      case 'short':
        return d.toLocaleDateString();
      case 'long':
        return d.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'time':
        return d.toLocaleTimeString();
      default:
        return d.toString();
    }
  },
  
  // Generate unique IDs
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // Validate input
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  // Sanitize input for safety
  sanitizeInput: (input) => {
    return input.replace(/[<>]/g, '');
  }
});

console.log('🔒 AgentricAI University preload script loaded - Secure IPC bridge established');