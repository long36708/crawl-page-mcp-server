# MCP服务器调试指南

## 概述

本文档提供了完整的MCP服务器调试方法和工具，帮助开发者快速定位和解决问题。

## 调试工具

### 1. 交互式调试器

最推荐的调试方式，提供实时交互测试功能。

```bash
# 启动调试器
npm run debug
# 或直接运行
node debug-server.js
```

#### 可用命令

| 命令    | 语法                              | 描述             |
| ------- | --------------------------------- | ---------------- |
| `list`  | `list`                            | 列出所有可用工具 |
| `crawl` | `crawl <url> [format] [selector]` | 抓取网页内容     |
| `links` | `links <url> [pattern]`           | 提取页面链接     |
| `test`  | `test`                            | 运行预设测试用例 |
| `help`  | `help`                            | 显示帮助信息     |
| `exit`  | `exit`                            | 退出调试器       |

#### 使用示例

```bash
# 启动调试器后输入以下命令
list                                    # 查看工具列表
crawl https://example.com              # 抓取页面为Markdown
crawl https://example.com html         # 抓取为HTML格式
crawl https://example.com markdown h1  # 只抓取h1标签内容
links https://example.com              # 提取所有链接
links https://example.com ".*\.pdf$"   # 只提取PDF链接
test                                   # 运行测试套件
```

### 2. 快速功能测试

用于验证基本功能是否正常工作。

```bash
# 测试HTTP抓取功能
npm run test:crawl

# 测试MCP协议通信
node quick-debug-test.js
```

### 3. VS Code调试

提供断点调试和变量检查功能。

#### 配置文件位置

`.vscode/launch.json`

#### 可用配置

- **Debug MCP Server** - 调试主服务器
- **Debug Test Crawl** - 调试抓取测试
- **Debug Interactive** - 调试交互式工具

#### 使用方法

1. 在VS Code中打开项目
2. 按F5或点击调试按钮
3. 选择相应的调试配置
4. 设置断点进行调试

### 4. 日志调试

启用详细日志输出来追踪问题。

```bash
# 启用调试日志
DEBUG=true npm start

# 或在环境变量中设置
export DEBUG=true
npm start
```

#### 日志级别

- **INFO** - 基本信息
- **DEBUG** - 详细调试信息
- **ERROR** - 错误信息

## 常见问题排查

### 1. 服务器启动失败

#### 检查依赖

```bash
npm install
```

#### 检查构建

```bash
npm run build
```

#### 查看详细错误

```bash
DEBUG=true node dist/index.js 2>&1 | tee debug.log
```

### 2. 网页抓取失败

#### 网络连接测试

```bash
curl -I https://example.com
```

#### User-Agent问题

某些网站可能阻止默认的User-Agent，可以自定义：

```json
{
  "url": "https://example.com",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}
```

#### 超时问题

增加超时时间：

```json
{
  "url": "https://slow-site.com",
  "timeout": 30000
}
```

### 3. CSS选择器问题

#### 验证选择器

1. 在浏览器开发者工具中测试选择器
2. 使用在线CSS选择器测试工具

#### 调试选择器匹配

在代码中添加调试信息：

```typescript
console.error('Debug: 找到元素数量', targetElement.length);
console.error('Debug: 元素内容预览', targetElement.text().substring(0, 100));
```

### 4. Markdown转换问题

#### 测试转换功能

```javascript
import TurndownService from 'turndown';
const turndown = new TurndownService();
console.log(turndown.turndown('<h1>Test</h1><p>Content</p>'));
```

#### 自定义转换规则

```javascript
turndown.addRule('customRule', {
  filter: 'div',
  replacement: function (content) {
    return content;
  },
});
```

## 性能调试

### 1. 内存监控

```javascript
// 在关键位置添加内存监控
console.error('Memory usage:', process.memoryUsage());
```

### 2. 请求时间监控

```javascript
const startTime = Date.now();
// ... 执行请求
console.error('Request took:', Date.now() - startTime, 'ms');
```

### 3. 并发控制

```javascript
// 限制并发请求数量
const pLimit = require('p-limit');
const limit = pLimit(3); // 最多3个并发请求
```

## 集成测试

### 1. 单元测试

```bash
npm test
```

### 2. 端到端测试

使用真实的MCP客户端测试：

```bash
# 配置MCP客户端
{
  "mcpServers": {
    "crawl-page": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/project"
    }
  }
}
```

## 生产环境调试

### 1. 错误监控

```javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### 2. 健康检查

```javascript
setInterval(() => {
  console.error('Health check: Server is running');
}, 60000); // 每分钟输出一次
```

### 3. 日志轮转

建议使用日志管理工具如winston：

```bash
npm install winston
```

## 调试最佳实践

### 1. 逐步调试

1. 先测试基本HTTP请求
2. 再测试HTML解析
3. 最后测试Markdown转换

### 2. 使用调试器

- 优先使用交互式调试器
- 对复杂问题使用VS Code断点调试
- 生产环境使用日志调试

### 3. 保存调试信息

```bash
# 保存调试日志
DEBUG=true npm start 2>&1 | tee debug-$(date +%Y%m%d-%H%M%S).log
```

### 4. 版本控制调试配置

- 将调试配置文件加入版本控制
- 为不同环境创建不同的调试配置

## 故障排除清单

- [ ] 依赖是否正确安装
- [ ] 项目是否成功构建
- [ ] 网络连接是否正常
- [ ] URL格式是否正确
- [ ] CSS选择器是否有效
- [ ] 超时设置是否合理
- [ ] User-Agent是否被阻止
- [ ] 内存使用是否正常
- [ ] 日志是否有错误信息

## 获取帮助

如果遇到无法解决的问题：

1. 查看详细错误日志
2. 使用调试器逐步排查
3. 检查网络和权限问题
4. 参考示例代码和文档
5. 在项目仓库提交issue
