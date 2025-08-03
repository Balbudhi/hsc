#!/bin/bash
# Manual deployment script for MIT AFS

set -e

echo "🚀 Deploying HSC website to MIT..."

# Build the project
echo "📦 Building project..."
npm install
npm run build 2>/dev/null || echo "No build script found, skipping..."

# Connect to MIT Athena
echo "🔗 Connecting to MIT Athena..."
echo "You'll need to enter your MIT credentials..."

ssh -t athena.dialup.mit.edu << 'EOF'
cd /mit/hsc/www

echo "📁 Current directory: $(pwd)"

# Backup current version
echo "💾 Creating backup..."
if [ -d "backup" ]; then rm -rf backup; fi
mkdir backup
cp -r *.html *.css *.js assets backup/ 2>/dev/null || echo "Some files may not exist yet"

# Clone or pull from GitHub
if [ -d ".git" ]; then
  echo "🔄 Pulling latest changes..."
  git pull origin main
else
  echo "📥 Cloning repository..."
  git clone https://github.com/YOUR_USERNAME/mit-hsc-website.git .
fi

# Copy public files to web directory
echo "📤 Copying files..."
cp -r public/* .

# Set proper AFS permissions
echo "🔐 Setting permissions..."
fs sa . system:anyuser rl
fs sa . www:apache rl

echo "✅ Deployment complete!"
echo "🌐 Website available at: http://web.mit.edu/hsc/www/"
EOF