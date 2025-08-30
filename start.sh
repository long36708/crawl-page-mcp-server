#!/bin/bash

# 构建项目
echo "构建项目..."
npm run build

# 启动MCP服务器
echo "启动 Crawl Page MCP Server..."
node dist/index.js