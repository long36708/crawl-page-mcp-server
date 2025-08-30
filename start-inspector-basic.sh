#!/bin/bash

echo "🚀 启动 MCP Inspector..."

# 确保项目已构建
if [ ! -d "dist" ]; then
    echo "📦 项目未构建，正在构建..."
    npm run build
fi

echo "🌐 启动 Inspector..."
echo "📋 使用说明:"
echo "1. Inspector 将在浏览器中打开"
echo "2. 点击 'Add Server' 添加服务器"
echo "3. 手动配置服务器:"
echo "   - Server Name: crawl-page"
echo "   - Command: node"
echo "   - Args: [\"./dist/index.js\"]"
echo "   - Working Directory: $(pwd)"
echo "   - Environment: {\"DEBUG\": \"true\"}"
echo ""

npx @modelcontextprotocol/inspector