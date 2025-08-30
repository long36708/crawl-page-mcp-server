# 性能优化指南

## 概述

本文档介绍如何优化爬取页面的性能，减少超时问题，提高响应速度。

## 优化措施

### 1. 连接池优化

使用HTTP连接池复用连接，减少建立连接的开销：

```javascript
// 自动配置的连接池
httpAgent: new Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 10,
  maxFreeSockets: 5,
  timeout: 60000,
})
```

### 2. 请求优化

- **压缩支持**: 启用gzip、deflate、br压缩
- **重定向限制**: 最多3次重定向
- **内容大小限制**: 最大10MB
- **超时设置**: 默认15秒，可自定义

### 3. 缓存机制

启用智能缓存，避免重复请求：

```json
{
  "url": "https://example.com",
  "useCache": true  // 默认启用，5分钟TTL
}
```

### 4. HTML解析优化

- **移除无用元素**: 自动移除script、style、noscript等
- **空白符规范化**: 压缩多余空白符
- **选择器优化**: 只解析需要的部分

### 5. 内容格式优化

根据需求选择最适合的格式：

| 格式 | 性能 | 用途 |
|------|------|------|
| `text` | 最快 | 纯文本提取 |
| `html` | 中等 | 保留结构 |
| `markdown` | 较慢 | 格式化输出 |

## 使用建议

### 1. 超时设置

根据网站类型调整超时时间：

```json
{
  "url": "https://fast-site.com",
  "timeout": 5000    // 快速网站
}

{
  "url": "https://slow-site.com",
  "timeout": 30000   // 慢速网站
}
```

### 2. 选择器优化

使用精确的CSS选择器减少解析时间：

```json
// 好的做法
{
  "selector": "article .content"  // 精确定位
}

// 避免的做法
{
  "selector": "*"  // 选择所有元素
}
```

### 3. 缓存策略

合理使用缓存：

```json
// 启用缓存（推荐）
{
  "url": "https://static-content.com",
  "useCache": true
}

// 禁用缓存（实时数据）
{
  "url": "https://live-data.com",
  "useCache": false
}
```

## 性能测试

### 运行性能测试

```bash
npm run test:performance
```

### 测试结果解读

```
📊 测试: 快速HTML页面
✅ 完成: 1234ms (期望: <3000ms)
   内容长度: 5678 字符
   🌐 网络请求: 890ms
```

- **完成时间**: 总处理时间
- **期望时间**: 性能目标
- **内容长度**: 提取的内容大小
- **网络请求**: 纯网络耗时

## 故障排除

### 1. 超时问题

**症状**: `timeout of 10000ms exceeded`

**解决方案**:
```json
{
  "timeout": 30000,  // 增加超时时间
  "format": "text"   // 使用更快的格式
}
```

### 2. 内存问题

**症状**: 内存使用过高

**解决方案**:
```json
{
  "selector": ".main-content",  // 限制解析范围
  "format": "text"              // 避免复杂转换
}
```

### 3. 网络慢

**症状**: 网络请求时间过长

**解决方案**:
- 检查网络连接
- 使用CDN或镜像站点
- 启用缓存机制

## 最佳实践

### 1. 分层优化

```javascript
// 第一层：快速文本提取
{
  "format": "text",
  "selector": "h1, h2, p"
}

// 第二层：结构化内容
{
  "format": "markdown",
  "selector": "article"
}

// 第三层：完整页面
{
  "format": "html"
}
```

### 2. 批量处理

```javascript
// 避免：连续请求同一域名
crawl("https://site.com/page1")
crawl("https://site.com/page2")

// 推荐：添加延迟
crawl("https://site.com/page1")
await delay(1000)
crawl("https://site.com/page2")
```

### 3. 错误重试

```javascript
// 实现指数退避重试
async function crawlWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await crawl(url, {
        timeout: 10000 + (i * 5000)  // 递增超时
      });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(Math.pow(2, i) * 1000);  // 指数退避
    }
  }
}
```

## 性能监控

### 1. 启用调试日志

```bash
DEBUG=true npm start
```

### 2. 监控指标

- **请求时间**: HTTP请求耗时
- **解析时间**: HTML解析耗时
- **转换时间**: 格式转换耗时
- **缓存命中率**: 缓存使用效率

### 3. 性能基准

| 操作 | 目标时间 | 说明 |
|------|----------|------|
| 简单页面 | <3秒 | 基本HTML页面 |
| 复杂页面 | <10秒 | 大型网站 |
| 缓存命中 | <100ms | 来自缓存的响应 |

## 配置文件

参考 `performance-config.json` 进行自定义配置：

```json
{
  "crawling": {
    "defaultTimeout": 15000,
    "maxContentSize": 10485760
  },
  "caching": {
    "enabled": true,
    "defaultTTL": 300000
  }
}