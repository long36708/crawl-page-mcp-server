# 安装和使用指南

## 通过 npx 直接使用

### 1. 直接运行MCP服务器
```bash
npx crawl-page-mcp-server
```

### 2. 运行调试器
```bash
npx crawl-page-mcp-server crawl-page-debug
```

## 全局安装

### 1. 安装到全局
```bash
npm install -g crawl-page-mcp-server
```

### 2. 使用全局命令
```bash
# 启动MCP服务器
crawl-page-mcp

# 启动调试器
crawl-page-debug
```

## 本地开发安装

### 1. 克隆项目
```bash
git clone <repository-url>
cd crawl-page-mcp-server
```

### 2. 安装依赖
```bash
npm install
```

### 3. 构建项目
```bash
npm run build
```

### 4. 本地测试
```bash
# 启动服务器
npm start

# 启动调试器
npm run debug
```

## MCP客户端配置

### 使用全局安装的版本
```json
{
  "mcpServers": {
    "crawl-page": {
      "command": "crawl-page-mcp"
    }
  }
}
```

### 使用npx版本
```json
{
  "mcpServers": {
    "crawl-page": {
      "command": "npx",
      "args": ["crawl-page-mcp-server"]
    }
  }
}
```

### 使用本地开发版本
```json
{
  "mcpServers": {
    "crawl-page": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/crawl-page-mcp-server"
    }
  }
}
```

## 环境要求

- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本

## 验证安装

### 1. 检查版本
```bash
npx crawl-page-mcp-server --version
```

### 2. 运行健康检查
```bash
npx crawl-page-mcp-server crawl-page-debug
# 在调试器中输入: test
```

## 故障排除

### 权限问题
```bash
# macOS/Linux
sudo npm install -g crawl-page-mcp-server

# Windows (以管理员身份运行)
npm install -g crawl-page-mcp-server
```

### 网络问题
```bash
# 使用淘宝镜像
npm install -g crawl-page-mcp-server --registry=https://registry.npmmirror.com
```

### 构建问题
```bash
# 清理缓存
npm cache clean --force
npm install -g crawl-page-mcp-server