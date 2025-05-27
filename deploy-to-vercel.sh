#!/bin/bash

# Vercel deployment script for Dhaneja e-commerce platform
# Usage: ./deploy-to-vercel.sh

echo "===== Dhaneja Vercel Deployment Script ====="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing Vercel CLI globally..."
    npm install -g vercel
fi

# Check for git
if ! command -v git &> /dev/null; then
    echo "Git not found. Please install git before proceeding."
    exit 1
fi

# Ensure we have a git repository
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
fi

# Login to Vercel (if needed)
echo "Logging into Vercel..."
vercel login

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel

echo ""
echo "Deployment complete! Your site is now live on Vercel."
echo "You can set up environment variables in the Vercel dashboard."
