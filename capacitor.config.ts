import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agentricai.university',
  appName: 'AgentricAI University',
  webDir: 'dist-mobile',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  
  // AAC device optimizations
  android: {
    buildOptions: {
      keystorePath: 'android/keystore/agentricai-university.keystore',
      keystorePassword: process.env.KEYSTORE_PASSWORD,
      keystoreAlias: 'agentricai',
      keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASSWORD,
      signingType: 'apksigner'
    },
    
    // Permissions for AAC devices
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.VIBRATE',
      'android.permission.WAKE_LOCK',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.RECEIVE_BOOT_COMPLETED'
    ],
    
    // Manifest configurations for AAC
    androidManifestConfig: {
      application: {
        allowBackup: true,
        icon: '@mipmap/ic_launcher',
        label: '@string/app_name',
        theme: '@style/AppTheme',
        hardwareAccelerated: true,
        largeHeap: true,
        usesCleartextTraffic: true,
        
        // AAC-specific configurations
        supportsRtl: true,
        extractNativeLibs: false,
        
        // Accessibility services
        service: [
          {
            name: '.AccessibilityService',
            permission: 'android.permission.BIND_ACCESSIBILITY_SERVICE',
            exported: true,
            metaData: [
              {
                name: 'android.accessibilityservice',
                resource: '@xml/accessibility_service_config'
              }
            ]
          }
        ]
      },
      
      // Uses features for AAC devices
      usesFeature: [
        {
          name: 'android.hardware.touchscreen',
          required: true
        },
        {
          name: 'android.hardware.touchscreen.multitouch',
          required: false
        },
        {
          name: 'android.hardware.camera',
          required: false
        },
        {
          name: 'android.hardware.microphone',
          required: false
        },
        {
          name: 'android.hardware.bluetooth',
          required: false
        }
      ],
      
      // Intent filters for AAC communication
      activity: [
        {
          name: '.MainActivity',
          exported: true,
          launchMode: 'singleTask',
          screenOrientation: 'landscape',
          configChanges: 'orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode',
          intentFilter: [
            {
              action: ['android.intent.action.MAIN'],
              category: ['android.intent.category.LAUNCHER']
            },
            {
              action: ['android.intent.action.VIEW'],
              category: ['android.intent.category.DEFAULT'],
              data: [{ scheme: 'agentricai' }]
            }
          ]
        }
      ]
    }
  },
  
  // Plugins configuration
  plugins: {
    // Capacitor core plugins
    App: {
      launchUrl: 'student'
    },
    
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#87CEEB',
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#87CEEB'
    },
    
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true
    },
    
    // AAC-specific plugins
    TextToSpeech: {
      speechRate: 1.0,
      speechVolume: 1.0,
      speechPitch: 1.0,
      language: 'en-US'
    },
    
    Haptics: {
      enabled: true
    },
    
    Device: {
      enabled: true
    },
    
    Network: {
      enabled: true
    },
    
    // Accessibility plugin
    Accessibility: {
      enabled: true,
      announceForAccessibility: true,
      screenReaderSupport: true
    },
    
    // Local notifications for reminders
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'notification.wav'
    },
    
    // Camera for visual schedules and documentation
    Camera: {
      permissions: ['camera', 'storage']
    },
    
    // Geolocation for context-aware learning
    Geolocation: {
      permissions: ['location']
    },
    
    // Storage for offline functionality
    Storage: {
      group: 'AgentricAI'
    },
    
    // File system access
    Filesystem: {
      permissions: ['storage']
    },
    
    // Share functionality
    Share: {
      enabled: true
    },
    
    // Push notifications for parent/teacher updates
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;