#!/bin/bash

# Debug information
echo "Node version: $(node -v)"
echo "npm version: $(npm -v)"
echo "Directory contents:"
ls -la

# Try to create the dist directory in advance
mkdir -p dist

# Run the build
echo "Starting Vite build..."
npx vite build --config vite.config.js

# Check if build succeeded
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
  echo "Build failed or dist is empty, using fallback page..."
  mkdir -p dist
  cp minimal-index.html dist/index.html
  echo "Created fallback index.html"
else
  echo "Build succeeded! Contents of dist directory:"
  ls -la dist
fi 