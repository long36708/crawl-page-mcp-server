#!/bin/bash

echo "🚀 启动优化版MCP爬虫服务器..."
echo "⚡ 超时设置: 全局5秒, 连接3秒, 请求4秒"
echo "📦 缓存: 启用 (5分钟TTL)"
echo "🔗 连接池: 最大5个连接"
echo ""

# 检查是否已构建
if [ ! -d "dist" ]; then
    echo "📦 构建项目..."
    npm run build
fi

echo "✅ 启动服务器 (优化版配置)"
echo "💡 如遇超时问题，请查看 TIMEOUT-OPTIMIZATION.md"
echo ""

# 启动服务器
node dist/index.js