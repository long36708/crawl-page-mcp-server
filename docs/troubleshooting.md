# 故障排除指南

## 常见问题及解决方案

### 1. 服务器启动问题

#### 问题：服务器无法启动

```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**解决方案：**

```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 检查Node.js版本（需要18+）
node --version

# 重新构建
npm run build
```

#### 问题：TypeScript编译错误

```
error TS2554: Expected 1 arguments but got 2
```

**解决方案：**

```bash
# 检查TypeScript版本
npx tsc --version

# 清理构建缓存
rm -rf dist/
npm run build
```

### 2. 网络连接问题

#### 问题：连接超时

```
错误: timeout of 10000ms exceeded
```

**解决方案：**

1. 增加超时时间：

```json
{
  "url": "https://slow-site.com",
  "timeout": 30000
}
```

2. 检查网络连接：

```bash
curl -I https://target-site.com
ping target-site.com
```

3. 检查防火墙设置

#### 问题：DNS解析失败

```
错误: getaddrinfo ENOTFOUND example.com
```

**解决方案：**

1. 检查DNS设置：

```bash
nslookup example.com
dig example.com
```

2. 尝试使用不同的DNS服务器：

```bash
# 临时使用Google DNS
export DNS_SERVER=8.8.8.8
```

#### 问题：SSL证书错误

```
错误: unable to verify the first certificate
```

**解决方案：**

1. 检查证书有效性：

```bash
openssl s_client -connect example.com:443
```

2. 在代码中添加证书验证跳过（仅用于测试）：

```javascript
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
```

### 3. HTTP状态码错误

#### 问题：403 Forbidden

```
错误: Request failed with status code 403
```

**解决方案：**

1. 更换User-Agent：

```json
{
  "url": "https://protected-site.com",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
}
```

2. 检查是否需要认证或特殊头部

#### 问题：404 Not Found

```
错误: Request failed with status code 404
```

**解决方案：**

1. 验证URL是否正确
2. 检查URL是否需要特定的路径或参数
3. 确认页面是否存在

#### 问题：429 Too Many Requests

```
错误: Request failed with status code 429
```

**解决方案：**

1. 添加请求延迟：

```javascript
await new Promise((resolve) => setTimeout(resolve, 2000));
```

2. 实现指数退避重试机制

### 4. 内容解析问题

#### 问题：CSS选择器无匹配

```
错误: 未找到匹配选择器 "article" 的元素
```

**解决方案：**

1. 在浏览器中验证选择器：

```javascript
// 在浏览器控制台中测试
document.querySelectorAll('article');
```

2. 使用更通用的选择器：

```json
{
  "selector": "article, .content, .main, #content"
}
```

3. 先抓取完整页面查看结构：

```json
{
  "url": "https://example.com",
  "format": "html"
}
```

#### 问题：Markdown转换异常

```
错误: Cannot read property 'turndown' of undefined
```

**解决方案：**

1. 检查turndown依赖：

```bash
npm list turndown
```

2. 重新安装turndown：

```bash
npm uninstall turndown
npm install turndown@^7.1.2
```

#### 问题：内容为空

```json
{
  "content": "",
  "contentLength": 0
}
```

**解决方案：**

1. 检查页面是否需要JavaScript渲染
2. 尝试不同的选择器
3. 检查页面是否有反爬虫机制

### 5. 内存和性能问题

#### 问题：内存溢出

```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**解决方案：**

1. 增加Node.js内存限制：

```bash
node --max-old-space-size=4096 dist/index.js
```

2. 使用CSS选择器限制内容范围：

```json
{
  "selector": ".content p:nth-child(-n+20)"
}
```

3. 分批处理大量URL

#### 问题：处理速度慢

**解决方案：**

1. 减少超时时间：

```json
{
  "timeout": 5000
}
```

2. 只抓取必要的内容：

```json
{
  "format": "text",
  "selector": "h1, h2, p"
}
```

### 6. 调试工具问题

#### 问题：调试器无法启动

```bash
node debug-server.js
# 无响应或报错
```

**解决方案：**

1. 检查项目是否已构建：

```bash
npm run build
```

2. 检查端口是否被占用：

```bash
lsof -i :3000
```

3. 使用详细日志模式：

```bash
DEBUG=true node debug-server.js
```

#### 问题：VS Code调试配置无效

**解决方案：**

1. 检查launch.json配置
2. 确保项目已构建
3. 重启VS Code

### 7. MCP协议问题

#### 问题：客户端连接失败

```
Error: Failed to connect to MCP server
```

**解决方案：**

1. 检查服务器是否正常启动：

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node dist/index.js
```

2. 验证MCP客户端配置：

```json
{
  "mcpServers": {
    "crawl-page": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/correct/path/to/project"
    }
  }
}
```

#### 问题：工具调用失败

```
Error: Tool not found: crawl_page
```

**解决方案：**

1. 检查工具是否正确注册：

```bash
# 使用调试器测试
node debug-server.js
# 输入: list
```

2. 验证参数格式是否正确

## 诊断工具

### 1. 健康检查脚本

创建 `health-check.js`：

```javascript
import axios from 'axios';

async function healthCheck() {
  const tests = [
    {
      name: 'HTTP请求测试',
      test: () => axios.get('https://httpbin.org/get', { timeout: 5000 }),
    },
    {
      name: 'HTML解析测试',
      test: () => axios.get('https://httpbin.org/html', { timeout: 5000 }),
    },
  ];

  for (const { name, test } of tests) {
    try {
      await test();
      console.log(`✅ ${name}: 通过`);
    } catch (error) {
      console.log(`❌ ${name}: 失败 - ${error.message}`);
    }
  }
}

healthCheck();
```

### 2. 网络诊断

```bash
#!/bin/bash
# network-check.sh

echo "=== 网络诊断 ==="
echo "1. DNS解析测试:"
nslookup google.com

echo "2. 网络连通性测试:"
ping -c 3 google.com

echo "3. HTTP连接测试:"
curl -I https://httpbin.org/get

echo "4. 代理设置检查:"
echo "HTTP_PROXY: $HTTP_PROXY"
echo "HTTPS_PROXY: $HTTPS_PROXY"
```

### 3. 系统信息收集

```javascript
// system-info.js
console.log('=== 系统信息 ===');
console.log('Node.js版本:', process.version);
console.log('平台:', process.platform);
console.log('架构:', process.arch);
console.log('内存使用:', process.memoryUsage());
console.log('环境变量:', {
  NODE_ENV: process.env.NODE_ENV,
  DEBUG: process.env.DEBUG,
  HTTP_PROXY: process.env.HTTP_PROXY,
});
```

## 日志分析

### 1. 启用详细日志

```bash
# 启用所有调试信息
DEBUG=* npm start

# 只启用特定模块的日志
DEBUG=crawl-page:* npm start

# 保存日志到文件
DEBUG=true npm start 2>&1 | tee debug.log
```

### 2. 日志级别说明

- **ERROR**: 严重错误，需要立即处理
- **WARN**: 警告信息，可能影响功能
- **INFO**: 一般信息，正常运行状态
- **DEBUG**: 详细调试信息，用于问题排查

### 3. 常见日志模式

```
[DEBUG] Tool call received: crawl_page { url: '...' }
[DEBUG] HTTP request started: GET https://...
[DEBUG] HTTP response received: 200 OK
[DEBUG] Content parsed, length: 1234
[DEBUG] Markdown conversion completed
```

## 获取支持

### 1. 收集诊断信息

在报告问题时，请提供：

- 错误信息和堆栈跟踪
- 系统信息（Node.js版本、操作系统）
- 重现步骤
- 相关配置文件
- 调试日志

### 2. 问题报告模板

```markdown
## 问题描述

简要描述遇到的问题

## 环境信息

- Node.js版本:
- 操作系统:
- 项目版本:

## 重现步骤

1.
2.
3.

## 期望结果

描述期望的正常行为

## 实际结果

描述实际发生的情况

## 错误日志
```

粘贴相关的错误日志

```

## 其他信息
任何其他可能有用的信息
```

### 3. 自助排查清单

在寻求帮助前，请检查：

- [ ] 依赖是否正确安装
- [ ] 项目是否成功构建
- [ ] 网络连接是否正常
- [ ] URL和参数是否正确
- [ ] 是否查看了错误日志
- [ ] 是否尝试了基本的故障排除步骤
- [ ] 是否查阅了相关文档
