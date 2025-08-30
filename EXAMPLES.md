# 使用示例

## 基本用法

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

## 实际应用场景

### 场景1：技术文档抓取

抓取技术文档并转换为Markdown格式，便于本地存储和处理：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://docs.python.org/3/tutorial/",
    "format": "markdown",
    "selector": ".body"
  }
}
```

### 场景2：新闻文章提取

从新闻网站提取文章内容：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://news.example.com/article/123",
    "format": "markdown",
    "selector": "article"
  }
}
```

### 场景3：链接收集

收集页面中的所有外部链接：

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://awesome-list.com",
    "filterPattern": "https://github\\.com/.*"
  }
}
```

### 场景4：博客文章抓取

抓取博客文章的主要内容：

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://blog.example.com/post/123",
    "format": "markdown",
    "selector": ".post-content"
  }
}
```

## 高级配置

### 自定义User-Agent

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://example.com",
    "userAgent": "MyBot/1.0 (compatible; CrawlPageMCP/1.0)",
    "timeout": 15000
  }
}
```

### 处理相对链接

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://example.com/page",
    "baseUrl": "https://example.com",
    "filterPattern": ".*\\.html$"
  }
}
```

## 错误处理

服务器会返回详细的错误信息：

- URL格式错误
- 网络连接超时
- 页面不存在（404）
- CSS选择器未匹配到内容
- 服务器错误（5xx）

## 输出格式说明

### crawl_page 输出结构

```json
{
  "url": "抓取的URL",
  "title": "页面标题",
  "description": "页面描述（来自meta标签）",
  "keywords": "页面关键词（来自meta标签）",
  "format": "输出格式",
  "content": "转换后的内容",
  "contentLength": "内容长度",
  "timestamp": "抓取时间戳"
}
```

### extract_links 输出结构

```json
{
  "url": "分析的URL",
  "totalLinks": "链接总数",
  "links": [
    {
      "href": "链接地址",
      "text": "链接文本",
      "title": "链接标题（可选）"
    }
  ],
  "timestamp": "提取时间戳"
}