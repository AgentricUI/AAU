const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    student: './src/ui/mobile/student/index.js',
    admin: './src/ui/mobile/admin/index.js'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist-mobile'),
    filename: '[name].[contenthash].js',
    publicPath: './',
    clean: true
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@mobile': path.resolve(__dirname, 'src/ui/mobile'),
      '@agents': path.resolve(__dirname, 'src/agents'),
      '@core': path.resolve(__dirname, 'src/core')
    }
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[hash][ext]'
        }
      },
      {
        test: /\.(mp3|wav|ogg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/audio/[name].[hash][ext]'
        }
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    
    // Student interface (AAC optimized)
    new HtmlWebpackPlugin({
      template: './src/ui/mobile/student/index.html',
      filename: 'student/index.html',
      chunks: ['student'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
      // AAC device specific meta tags
      templateParameters: {
        title: 'AgentricAI University - Student',
        description: 'Educational companion for neurodiverse learners',
        viewport: 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0',
        theme_color: '#87CEEB',
        background_color: '#87CEEB',
        display: 'standalone',
        orientation: 'landscape'
      }
    }),
    
    // Admin interface  
    new HtmlWebpackPlugin({
      template: './src/ui/mobile/admin/index.html',
      filename: 'admin/index.html', 
      chunks: ['admin'],
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      },
      templateParameters: {
        title: 'AgentricAI University - Admin',
        description: 'Parent and teacher administrative interface',
        viewport: 'width=device-width, initial-scale=1.0',
        theme_color: '#4682B4',
        background_color: '#F5F5F5'
      }
    }),

    // Copy static assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'assets/icons',
          to: 'assets/icons'
        },
        {
          from: 'assets/sounds',
          to: 'assets/sounds'
        },
        {
          from: 'src/agents/university-registry.json',
          to: 'config/agents.json'
        },
        {
          from: 'config/ecosystem.config.js',
          to: 'config/ecosystem.js'
        },
        // PWA manifest for AAC devices
        {
          from: 'src/ui/mobile/manifest.json',
          to: 'manifest.json'
        },
        // Service worker for offline functionality
        {
          from: 'src/ui/mobile/sw.js',
          to: 'sw.js'
        }
      ]
    })
  ],

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        
        // Common code between student and admin
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        },
        
        // Agent system (shared)
        agents: {
          test: /[\\/]src[\\/]agents[\\/]/,
          name: 'agents',
          chunks: 'all',
          priority: 8
        },
        
        // Core system (shared)
        core: {
          test: /[\\/]src[\\/]core[\\/]/,
          name: 'core', 
          chunks: 'all',
          priority: 8
        }
      }
    },
    
    // Runtime chunk for caching
    runtimeChunk: 'single'
  },

  // AAC device performance optimizations
  performance: {
    maxEntrypointSize: 500000, // 500KB
    maxAssetSize: 300000, // 300KB
    hints: 'warning'
  },

  // Source maps for debugging (lightweight for mobile)
  devtool: 'source-map',

  // Development server for testing
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist-mobile')
    },
    compress: true,
    port: 3001,
    host: '0.0.0.0', // Allow access from AAC devices on network
    allowedHosts: 'all',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    // Hot reload for development
    hot: true,
    liveReload: true
  },

  // Environment-specific configurations
  ...(process.env.NODE_ENV === 'development' && {
    mode: 'development',
    devtool: 'eval-source-map',
    optimization: {
      minimize: false
    }
  }),

  // AAC device specific externals (if using CDN for performance)
  externals: {
    // Common libraries that might be loaded from CDN on AAC devices
    'react': 'React',
    'react-dom': 'ReactDOM'
  },

  // Target web for maximum compatibility with AAC device browsers
  target: ['web', 'es5']
};