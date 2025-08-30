# MCP服务器调试指南

## 调试方法

### 1. 使用调试器工具

我们提供了一个交互式调试工具，可以方便地测试MCP服务器功能：

```bash
# 确保项目已构建
npm run build

# 启动调试器
node debug-server.js
```

调试器提供以下命令：
- `list` - 列出所有可用工具
- `crawl <url> [format] [selector]` - 抓取网页
- `links <url> [pattern]` - 提取链接
- `test` - 运行测试用例
- `help` - 显示帮助
- `exit` - 退出

### 2. 手动测试

#### 测试基本HTTP抓取功能
```bash
node test-crawl.js
```

#### 使用curl测试（如果有HTTP接口）
```bash
# 这个MCP服务器使用stdio通信，不支持HTTP
```

### 3. 日志调试

在代码中添加调试日志：

```typescript
// 在 src/index.ts 中添加
console.error('Debug: 收到请求', request.params);
console.error('Debug: 处理结果', result);
```

### 4. VS Code调试配置

创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug MCP Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "console": "integratedTerminal",
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

## 常见问题排查

### 1. 服务器启动失败

**检查依赖安装：**
```bash
npm install
```

**检查构建：**
```bash
npm run build
```

**查看错误日志：**
```bash
node dist/index.js 2>&1 | tee debug.log
```

### 2. 网页抓取失败

**测试网络连接：**
```bash
curl -I https://example.com
```

**检查User-Agent限制：**
```javascript
// 在调试器中使用自定义User-Agent
crawl https://example.com markdown "" "Mozilla/5.0 (compatible; MyBot/1.0)"
```

**检查超时设置：**
```javascript
// 增加超时时间
{
  "url": "https://slow-site.com",
  "timeout": 30000
}
```

### 3. CSS选择器问题

**验证选择器：**
```bash
# 使用浏览器开发者工具验证CSS选择器
# 或使用在线工具测试
```

**调试选择器匹配：**
```javascript
// 在代码中添加调试信息
console.error('Debug: 找到元素数量', targetElement.length);
console.error('Debug: 元素内容预览', targetElement.text().substring(0, 100));
```

### 4. Markdown转换问题

**测试HTML到Markdown转换：**
```javascript
import TurndownService from 'turndown';
const turndown = new TurndownService();
console.log(turndown.turndown('<h1>Test</h1><p>Content</p>'));
```

## 性能调试

### 1. 监控内存使用

```javascript
// 在关键位置添加内存监控
console.error('Memory usage:', process.memoryUsage());
```

### 2. 监控请求时间

```javascript
// 在请求开始和结束时记录时间
const startTime = Date.now();
// ... 执行请求
console.error('Request took:', Date.now() - startTime, 'ms');
```

### 3. 限制并发请求

```javascript
// 如果需要处理多个URL，考虑限制并发数
const pLimit = require('p-limit');
const limit = pLimit(3); // 最多3个并发请求
```

## 集成测试

### 1. 创建测试套件

```bash
npm install --save-dev jest @types/jest
```

创建 `tests/integration.test.js`：

```javascript
import { spawn } from 'child_process';

describe('MCP Server Integration', () => {
  let server;

  beforeAll(() => {
    server = spawn('node', ['dist/index.js']);
  });

  afterAll(() => {
    server.kill();
  });

  test('should list tools', async () => {
    // 测试工具列表
  });

  test('should crawl page', async () => {
    // 测试页面抓取
  });
});
```

### 2. 端到端测试

使用真实的MCP客户端测试完整流程：

```bash
# 使用Claude Desktop或其他MCP客户端
# 配置服务器并测试实际使用场景
```

## 生产环境调试

### 1. 日志级别控制

```javascript
const DEBUG = process.env.DEBUG === 'true';

function debugLog(...args) {
  if (DEBUG) {
    console.error('[DEBUG]', ...args);
  }
}
```

### 2. 错误监控

```javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### 3. 健康检查

```javascript
// 添加简单的健康检查端点
setInterval(() => {
  console.error('Health check: Server is running');
}, 60000); // 每分钟输出一次