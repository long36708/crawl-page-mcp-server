# 测试文件目录

这个目录包含了MCP爬虫服务的各种测试和调试工具。

## 📁 文件说明

### 🧪 测试脚本

- **`quick-test.mjs`** - 快速功能测试
- **`test-large-content.mjs`** - 大内容处理测试
- **`performance-test.js`** - 性能基准测试

### 🔧 调试工具

- **`debug-server.js`** - 交互式调试服务器
- **`quick-test.cjs`** - CommonJS版本快速测试
- **`timeout-test.cjs`** - 超时测试

### ⚙️ 配置文件

- **`inspector-test-cases.json`** - MCP Inspector测试用例
- **`performance-config.json`** - 性能测试配置
- **`README.md`** - 测试目录说明文档

## 🚀 使用方法

### 运行测试

```bash
# 快速测试
npm test

# 性能测试
npm run test:performance

# 大内容测试
npm run test:large

# 交互式调试
npm run debug
```

### 直接运行

```bash
# ES模块测试
node test/quick-test.mjs
node test/test-large-content.mjs

# CommonJS测试
node test/quick-test.cjs
node test/timeout-test.cjs

# 性能测试
node test/performance-test.js

# 调试服务器
node test/debug-server.js
```

## 📊 测试覆盖

- ✅ 基本爬取功能
- ✅ 超时控制
- ✅ 大内容处理
- ✅ 缓存机制
- ✅ 性能基准
- ✅ 错误处理

## 🛠️ 调试功能

交互式调试服务器支持以下命令：

- `list` - 列出可用工具
- `crawl <url>` - 测试爬取功能
- `links <url>` - 测试链接提取
- `test` - 运行基本测试
- `help` - 显示帮助
- `exit` - 退出调试器
