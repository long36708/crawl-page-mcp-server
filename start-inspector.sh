#!/bin/bash

echo "🚀 启动 MCP Inspector 调试..."

# 检查项目是否已构建
if [ ! -d "dist" ]; then
    echo "📦 项目未构建，正在构建..."
    npm run build
fi

# 检查 Inspector 是否已安装
if ! command -v npx &> /dev/null; then
    echo "❌ npx 未找到，请安装 Node.js"
    exit 1
fi

echo "🔧 配置信息:"
echo "  - 服务器名称: crawl-page"
echo "  - 工作目录: $(pwd)"
echo "  - 配置文件: inspector-config.json"
echo ""

echo "📋 使用步骤:"
echo "1. Inspector 将在浏览器中自动打开"
echo "2. 点击 'Add Server' 添加服务器"
echo "3. 选择 'From Config File' 并选择 inspector-config.json"
echo "4. 或者手动配置:"
echo "   - Command: node"
echo "   - Args: [\"./dist/index.js\"]"
echo "   - Working Directory: $(pwd)"
echo "   - Environment: {\"DEBUG\": \"true\"}"
echo ""

echo "🌐 启动 Inspector..."
npx @modelcontextprotocol/inspector