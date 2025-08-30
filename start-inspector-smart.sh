#!/bin/bash

echo "🚀 启动 MCP Inspector..."

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # 端口被占用
    else
        return 1  # 端口可用
    fi
}

# 寻找可用端口
find_available_port() {
    local start_port=6274
    local port=$start_port
    
    while check_port $port; do
        echo "⚠️  端口 $port 被占用，尝试下一个端口..."
        port=$((port + 1))
        if [ $port -gt 6280 ]; then
            echo "❌ 无法找到可用端口 (6274-6280)"
            exit 1
        fi
    done
    
    echo $port
}

# 确保项目已构建
if [ ! -d "dist" ]; then
    echo "📦 项目未构建，正在构建..."
    npm run build
fi

# 寻找可用端口
available_port=$(find_available_port)
echo "✅ 使用端口: $available_port"

# 启动 Inspector
echo "🌐 启动 MCP Inspector..."
echo "📋 配置文件: inspector-config.json"
echo "🔗 访问地址: http://localhost:$available_port"
echo ""

npx @modelcontextprotocol/inspector --port $available_port