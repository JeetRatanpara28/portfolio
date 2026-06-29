#!/bin/bash
set -e

echo "🚀 Starting deployment..."
cd "$(dirname "$0")"

echo "📦 Building frontend..."
cd frontend && npm install && npm run build && cd ..

echo "📦 Building admin..."
cd admin && npm install && npm run build && cd ..

echo "🐳 Building Docker image..."
docker build -t jeet-portfolio .

echo "✅ Build complete! Ready to deploy to AWS."