#!/bin/bash

# Git Repository Cleanup Script
# This script cleans up your local git repository to remove deleted files
# and optimize storage space.

echo "🧹 Starting Git Repository Cleanup..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Show current repository size
echo "📊 Current repository size:"
du -sh .git

echo ""
echo "🔧 Step 1: Expiring reflog entries..."
git reflog expire --expire=now --all
git reflog expire --expire-unreachable=now --all

echo "🔧 Step 2: Running aggressive garbage collection..."
git gc --prune=now --aggressive

echo "🔧 Step 3: Pruning unreachable objects..."
git prune --expire=now

echo "🔧 Step 4: Cleaning up remote references..."
git remote prune origin

echo "🔧 Step 5: Final garbage collection..."
git gc --prune=now

echo ""
echo "📊 Repository size after cleanup:"
du -sh .git

echo ""
echo "✅ Cleanup complete!"
echo "📈 Object statistics:"
git count-objects -vH