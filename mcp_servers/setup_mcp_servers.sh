#!/bin/bash

# MCP Servers Setup Script
# This script sets up all the MCP servers for use with Claude Desktop

set -e

echo "🚀 Setting up MCP Servers..."

# Get the absolute path to the mcp_servers directory
MCP_SERVERS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVERS_DIR="$MCP_SERVERS_DIR/servers/src"

echo "📁 MCP Servers directory: $MCP_SERVERS_DIR"

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi
echo "✅ npm $(npm --version) found"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi
echo "✅ Python $(python3 --version) found"

# Check uv
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env
    if ! command -v uv &> /dev/null; then
        echo "❌ Failed to install uv. Please install it manually: https://docs.astral.sh/uv/getting-started/installation/"
        exit 1
    fi
fi
echo "✅ uv $(uv --version) found"

# Setup Python servers
echo "🐍 Setting up Python MCP servers..."

# Time server
echo "⏰ Setting up Time server..."
cd "$SERVERS_DIR/time"
uv sync
echo "✅ Time server ready"

# Git server
echo "🔧 Setting up Git server..."
cd "$SERVERS_DIR/git"
uv sync
echo "✅ Git server ready"

# Fetch server
echo "🌐 Setting up Fetch server..."
cd "$SERVERS_DIR/fetch"
uv sync
echo "✅ Fetch server ready"

# Setup TypeScript servers
echo "📦 Setting up TypeScript MCP servers..."

# Filesystem server
echo "📁 Setting up Filesystem server..."
cd "$SERVERS_DIR/filesystem"
npm install
npm run build
echo "✅ Filesystem server ready"

# Memory server
echo "🧠 Setting up Memory server..."
cd "$SERVERS_DIR/memory"
npm install
npm run build
echo "✅ Memory server ready"

# Test all servers
echo "🧪 Testing MCP servers..."

echo "Testing Time server..."
cd "$SERVERS_DIR/time"
timeout 3 uv run mcp-server-time --help > /dev/null 2>&1 && echo "✅ Time server test passed" || echo "⚠️  Time server test failed"

echo "Testing Git server..."
cd "$SERVERS_DIR/git"
timeout 3 uv run mcp-server-git --help > /dev/null 2>&1 && echo "✅ Git server test passed" || echo "⚠️  Git server test failed"

echo "Testing Fetch server..."
cd "$SERVERS_DIR/fetch"
timeout 3 uv run mcp-server-fetch --help > /dev/null 2>&1 && echo "✅ Fetch server test passed" || echo "⚠️  Fetch server test failed"

echo "Testing Filesystem server..."
cd "$SERVERS_DIR/filesystem"
timeout 3 node dist/index.js /tmp > /dev/null 2>&1 && echo "✅ Filesystem server test passed" || echo "⚠️  Filesystem server test failed"

echo "Testing Memory server..."
cd "$SERVERS_DIR/memory"
timeout 3 node dist/index.js > /dev/null 2>&1 && echo "✅ Memory server test passed" || echo "⚠️  Memory server test failed"

echo ""
echo "🎉 MCP Servers setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the configuration from $MCP_SERVERS_DIR/claude_desktop_config.json"
echo "2. Add it to your Claude Desktop configuration file:"
echo "   - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo "   - Windows: %APPDATA%/Claude/claude_desktop_config.json"
echo "   - Linux: ~/.config/Claude/claude_desktop_config.json"
echo "3. Restart Claude Desktop"
echo ""
echo "🔧 Available MCP servers:"
echo "   - Time: Time queries and timezone conversions"
echo "   - Git: Git repository operations"
echo "   - Fetch: Web content fetching and conversion"
echo "   - Filesystem: Secure file operations"
echo "   - Memory: Knowledge graph-based persistent memory"
echo ""
echo "📖 For more information, see the README files in each server directory."