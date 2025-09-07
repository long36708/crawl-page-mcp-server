# 使用示例

## 基本用法示例

### 1. 抓取网页并转换为Markdown

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://example.com",
    "format": "markdown"
  }
}
```

**输出：**

```json
{
  "url": "https://example.com",
  "title": "Example Domain",
  "description": "This domain is for use in illustrative examples",
  "keywords": "",
  "format": "markdown",
  "content": "# Example Domain\n\nThis domain is for use in illustrative examples in documents...",
  "contentLength": 234,
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

### 2. 抓取特定元素内容

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://news.ycombinator.com",
    "format": "markdown",
    "selector": ".storylink"
  }
}
```

### 3. 提取页面链接

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://example.com",
    "filterPattern": "https://.*\\.pdf$"
  }
}
```

**输出：**

```json
{
  "url": "https://example.com",
  "totalLinks": 3,
  "links": [
    {
      "href": "https://example.com/document1.pdf",
      "text": "Document 1",
      "title": "Download Document 1"
    },
    {
      "href": "https://example.com/report.pdf",
      "text": "Annual Report"
    }
  ],
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

## 实际应用场景

### 场景1：技术文档抓取

抓取Python官方文档并转换为Markdown格式：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://docs.python.org/3/tutorial/introduction.html",
    "format": "markdown",
    "selector": ".body"
  }
}
```

**用途：**

- 离线文档存储
- 文档内容分析
- 知识库构建

### 场景2：新闻文章提取

从新闻网站提取文章主要内容：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://news.example.com/article/123",
    "format": "markdown",
    "selector": "article .content",
    "timeout": 15000
  }
}
```

**用途：**

- 新闻聚合
- 内容分析
- 自动摘要生成

### 场景3：学术资源收集

收集学术网站的PDF链接：

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://arxiv.org/list/cs.AI/recent",
    "filterPattern": "https://arxiv\\.org/pdf/.*\\.pdf$"
  }
}
```

**用途：**

- 学术资源收集
- 论文批量下载
- 研究资料整理

### 场景4：博客文章抓取

抓取技术博客的文章内容：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://blog.example.com/post/machine-learning-basics",
    "format": "markdown",
    "selector": ".post-content",
    "userAgent": "Mozilla/5.0 (compatible; BlogCrawler/1.0)"
  }
}
```

**用途：**

- 技术文章收集
- 知识管理
- 内容备份

### 场景5：电商产品信息

提取电商网站的产品信息：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://shop.example.com/product/123",
    "format": "text",
    "selector": ".product-details"
  }
}
```

**用途：**

- 价格监控
- 产品信息收集
- 竞品分析

## 高级配置示例

### 1. 处理JavaScript渲染的页面

对于需要JavaScript渲染的页面，可能需要特殊处理：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://spa-example.com",
    "format": "markdown",
    "timeout": 20000,
    "userAgent": "Mozilla/5.0 (compatible; ModernBrowser/1.0)"
  }
}
```

### 2. 处理需要认证的页面

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://private-site.com/content",
    "format": "markdown",
    "userAgent": "Mozilla/5.0 (authorized-client)"
  }
}
```

### 3. 批量链接提取

提取多种类型的文件链接：

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://resources.example.com",
    "filterPattern": ".*\\.(pdf|doc|docx|ppt|pptx)$"
  }
}
```

### 4. 相对链接处理

处理包含相对链接的页面：

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://example.com/page/subpage",
    "baseUrl": "https://example.com",
    "filterPattern": ".*\\.html$"
  }
}
```

## 错误处理示例

### 1. 网络超时处理

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://slow-site.com",
    "timeout": 30000,
    "format": "markdown"
  }
}
```

### 2. 用户代理被阻止

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://protected-site.com",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "format": "markdown"
  }
}
```

### 3. CSS选择器无匹配

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://example.com",
    "selector": "article, .content, .main",
    "format": "markdown"
  }
}
```

## 性能优化示例

### 1. 只抓取文本内容

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://heavy-site.com",
    "format": "text",
    "selector": "p, h1, h2, h3"
  }
}
```

### 2. 限制内容长度

通过CSS选择器限制抓取范围：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://long-article.com",
    "format": "markdown",
    "selector": ".content p:nth-child(-n+10)"
  }
}
```

## 调试示例

### 1. 使用调试器测试

```bash
# 启动调试器
node debug-server.js

# 输入命令
crawl https://httpbin.org/html markdown
links https://httpbin.org/links/5
test
```

### 2. 快速功能验证

```bash
# 测试基本抓取功能
npm run test:crawl

# 测试MCP协议
node quick-debug-test.js
```

## 集成示例

### 1. 在MCP客户端中配置

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

### 2. 在代码中使用

```javascript
// 示例：使用MCP客户端调用
const client = new MCPClient();
await client.connect();

const result = await client.callTool('crawl_page', {
  url: 'https://example.com',
  format: 'markdown',
});

console.log(result.content);
```

## 最佳实践示例

### 1. 错误重试机制

```javascript
async function crawlWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await client.callTool('crawl_page', {
        url,
        timeout: 10000 + i * 5000, // 递增超时时间
      });
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 2. 批量处理

```javascript
async function crawlMultiplePages(urls) {
  const results = [];
  for (const url of urls) {
    try {
      const result = await client.callTool('crawl_page', { url });
      results.push(result);
      // 添加延迟避免过于频繁的请求
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to crawl ${url}:`, error);
    }
  }
  return results;
}
```

### 3. 内容验证

```javascript
function validateContent(result) {
  const content = JSON.parse(result.content[0].text);

  // 检查内容长度
  if (content.contentLength < 100) {
    console.warn('Content seems too short');
  }

  // 检查是否包含错误页面标识
  if (content.title.includes('404') || content.title.includes('Error')) {
    throw new Error('Page not found or error page');
  }

  return content;
}
```
