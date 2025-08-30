# Crawl Page MCP Server

一个用于抓取网页内容并转换为Markdown格式的MCP（Model Context Protocol）服务器。

## 功能特性

- 🌐 抓取任意URL的网页内容
- 📝 支持多种输出格式：HTML、纯文本、Markdown
- 🎯 支持CSS选择器精确提取页面内容
- 🔗 提取页面中的所有链接
- ⚙️ 可配置请求超时和User-Agent
- 🛡️ 内置错误处理和URL验证

## 安装

```bash
npm install
npm run build
```

## 安装和使用

### 通过 npx 直接使用（推荐）

```bash
# 直接运行MCP服务器
npx crawl-page-mcp-server

# 运行调试器
npx crawl-page-mcp-server crawl-page-debug

# 查看版本
npx crawl-page-mcp-server --version

# 查看帮助
npx crawl-page-mcp-server --help
```

### 全局安装

```bash
# 安装到全局
npm install -g crawl-page-mcp-server

# 使用全局命令
crawl-page-mcp              # 启动MCP服务器
crawl-page-debug           # 启动调试器
```

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd crawl-page-mcp-server

# 安装依赖并构建
npm install
npm run build

# 启动服务器
npm start

# 启动调试器
npm run debug
```

## 工具说明

### 1. crawl_page

抓取指定URL的页面内容。

**参数：**
- `url` (必需): 要抓取的网页URL地址
- `format` (可选): 输出格式，可选值：`html`、`text`、`markdown`（默认）
- `selector` (可选): CSS选择器，用于提取页面特定部分的内容
- `timeout` (可选): 请求超时时间（毫秒），默认10秒
- `userAgent` (可选): 自定义User-Agent字符串

**示例：**
```json
{
  "url": "https://example.com",
  "format": "markdown",
  "selector": "article",
  "timeout": 15000
}
```

### 2. extract_links

从指定URL页面中提取所有链接。

**参数：**
- `url` (必需): 要分析的网页URL地址
- `baseUrl` (可选): 基础URL，用于解析相对链接
- `filterPattern` (可选): 正则表达式模式，用于过滤链接
- `timeout` (可选): 请求超时时间（毫秒），默认10秒

**示例：**
```json
{
  "url": "https://example.com",
  "filterPattern": "https://.*\\.pdf$",
  "timeout": 10000
}
```

## 输出格式

### crawl_page 输出

```json
{
  "url": "https://example.com",
  "title": "页面标题",
  "description": "页面描述",
  "keywords": "关键词",
  "format": "markdown",
  "content": "转换后的内容...",
  "contentLength": 1234,
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

### extract_links 输出

```json
{
  "url": "https://example.com",
  "totalLinks": 25,
  "links": [
    {
      "href": "https://example.com/page1",
      "text": "链接文本",
      "title": "链接标题"
    }
  ],
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

## 配置MCP客户端

### 使用 npx（推荐）
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

### 使用全局安装
```json
{
  "mcpServers": {
    "crawl-page": {
      "command": "crawl-page-mcp"
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

## 技术栈

- **TypeScript**: 类型安全的JavaScript
- **@modelcontextprotocol/sdk**: MCP协议SDK
- **axios**: HTTP客户端
- **cheerio**: 服务端jQuery实现
- **turndown**: HTML到Markdown转换器

## 依赖打包说明

本项目使用 **esbuild** 将所有第三方依赖打包到单个可执行文件中，用户无需单独安装 axios、cheerio、turndown 等依赖。

### 打包策略
- **包含的依赖**: axios, cheerio, turndown, url 等所有运行时依赖
- **外部依赖**: 仅保留 @modelcontextprotocol/sdk 作为外部依赖
- **文件大小**: 约 3.0MB（包含所有依赖）
- **格式**: CommonJS with shebang，可直接执行

### 构建过程
```bash
# 开发时使用 tsx 直接运行 TypeScript
npm run dev

# 构建时使用 esbuild 打包所有依赖
npm run build
```

### 为什么使用 esbuild 而不是 tsx？
- **tsx**: 仅为 TypeScript 运行时工具，不能打包依赖
- **tsc**: TypeScript 编译器，只编译不打包，依赖仍为外部引用
- **esbuild**: 真正的打包工具，能将依赖打包到单个文件中

这种方案确保了：
- ✅ **用户体验**: 只需安装一个包即可使用
- ✅ **依赖管理**: 避免版本冲突和依赖缺失
- ✅ **部署简单**: 单文件部署，无需额外配置
- ✅ **性能优化**: 减少模块解析时间

## 开发

### 项目结构

```
crawl-page-mcp-server/
├── src/
│   └── index.ts          # 主服务器文件
├── dist/                 # 编译输出目录
├── package.json
├── tsconfig.json
└── README.md
```

### 构建

```bash
npm run build
```

### 测试

```bash
npm test
```

## 调试和测试

### 使用 MCP Inspector（推荐）
```bash
# 启动可视化调试工具
npm run inspector

# 使用预配置文件启动
npm run inspector:config

# 或直接使用
npx @modelcontextprotocol/inspector
```

### 使用自定义调试器
```bash
npm run debug
```

### 快速功能测试
```bash
npm run test:crawl
```

## 文档

详细文档请查看 [docs](./docs/) 目录：

- 🚀 [快速开始](./docs/quick-start.md) - 快速上手指南
- 📖 [API参考文档](./docs/api-reference.md) - 详细的API接口说明
- 💡 [使用示例](./docs/examples.md) - 丰富的使用示例和应用场景
- 🔧 [调试指南](./docs/debugging.md) - 完整的调试方法和工具
- ⚡ [超时优化](./docs/timeout-optimization.md) - 性能优化和超时问题解决
- 🔍 [Inspector调试](./docs/inspector-debugging.md) - 使用MCP Inspector进行可视化调试
- 🚨 [故障排除](./docs/troubleshooting.md) - 常见问题解决方案

## 许可证

MIT License