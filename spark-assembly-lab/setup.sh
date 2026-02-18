#!/bin/bash

# Spark Assembly Lab - Quick Setup Script

echo "🧩 Setting up Spark Assembly Lab..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the spark-assembly-lab directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔗 Creating symlink to sparks directory..."
if [ -L "public/sparks" ] || [ -d "public/sparks" ]; then
    rm -rf public/sparks
fi
ln -s ../../sparks public/sparks

if [ $? -ne 0 ]; then
    echo "❌ Failed to create symlink"
    exit 1
fi

echo "✅ Symlink created: public/sparks -> ../../sparks"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🐳 Or use Docker:"
echo "   docker compose up"
echo ""
echo "🌐 The app will be available at: http://localhost:3000"
echo ""
