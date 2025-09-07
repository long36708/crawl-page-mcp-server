# API参考文档

## 工具列表

### 1. crawl_page

抓取指定URL的页面内容并转换为指定格式。

#### 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| `url` | string | ✅ | - | 要抓取的网页URL地址 |
| `format` | string | ❌ | `markdown` | 输出格式：`html`、`text`、`markdown` |
| `selector` | string | ❌ | - | CSS选择器，用于提取页面特定部分 |
| `timeout` | number | ❌ | `10000` | 请求超时时间（毫秒） |
| `userAgent` | string | ❌ | `Mozilla/5.0 (compatible; CrawlPageMCP/1.0)` | 自定义User-Agent |

#### 输出格式

```json
{
  "url": "https://example.com",
  "title": "页面标题",
  "description": "页面描述（来自meta标签）",
  "keywords": "页面关键词（来自meta标签）",
  "format": "markdown",
  "content": "转换后的内容...",
  "contentLength": 1234,
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

#### 使用示例

##### 基本用法

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://example.com"
  }
}
```

##### 指定输出格式

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://example.com",
    "format": "html"
  }
}
```

##### 使用CSS选择器

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://news.example.com/article/123",
    "format": "markdown",
    "selector": "article .content"
  }
}
```

##### 自定义配置

```json
{
  "name": "crawl_page",
  "arguments": {
    "url": "https://example.com",
    "format": "text",
    "timeout": 15000,
    "userAgent": "MyBot/1.0"
  }
}
```

### 2. extract_links

从指定URL页面中提取所有链接。

#### 参数

| 参数名          | 类型   | 必需 | 默认值  | 描述                         |
| --------------- | ------ | ---- | ------- | ---------------------------- |
| `url`           | string | ✅   | -       | 要分析的网页URL地址          |
| `baseUrl`       | string | ❌   | -       | 基础URL，用于解析相对链接    |
| `filterPattern` | string | ❌   | -       | 正则表达式模式，用于过滤链接 |
| `timeout`       | number | ❌   | `10000` | 请求超时时间（毫秒）         |

#### 输出格式

```json
{
  "url": "https://example.com",
  "totalLinks": 25,
  "links": [
    {
      "href": "https://example.com/page1",
      "text": "链接文本",
      "title": "链接标题（可选）"
    }
  ],
  "timestamp": "2023-12-01T12:00:00.000Z"
}
```

#### 使用示例

##### 基本用法

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://example.com"
  }
}
```

##### 过滤特定链接

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://example.com",
    "filterPattern": ".*\\.pdf$"
  }
}
```

##### 处理相对链接

```json
{
  "name": "extract_links",
  "arguments": {
    "url": "https://example.com/page",
    "baseUrl": "https://example.com"
  }
}
```

## 错误处理

### 错误响应格式

```json
{
  "content": [
    {
      "type": "text",
      "text": "错误: 错误描述信息"
    }
  ],
  "isError": true
}
```

### 常见错误类型

#### 1. URL格式错误

```
错误: 无效的URL地址
```

#### 2. 网络连接错误

```
错误: connect ECONNREFUSED
错误: getaddrinfo ENOTFOUND
```

#### 3. 超时错误

```
错误: timeout of 10000ms exceeded
```

#### 4. CSS选择器错误

```
错误: 未找到匹配选择器 "article" 的元素
```

#### 5. HTTP错误

```
错误: Request failed with status code 404
错误: Request failed with status code 403
```

## 输出格式详解

### HTML格式

返回原始HTML内容，保留所有标签和属性。

```html
<h1>标题</h1>
<p>段落内容</p>
<a href="link.html">链接</a>
```

### Text格式

返回纯文本内容，移除所有HTML标签。

```
标题
段落内容
链接
```

### Markdown格式

将HTML转换为Markdown格式。

```markdown
# 标题

段落内容

[链接](link.html)
```

## 配置选项

### User-Agent字符串

常用的User-Agent字符串：

```javascript
// Chrome
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// Firefox
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0';

// Safari
'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15';

// 移动设备
'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
```

### 超时设置建议

| 网站类型 | 建议超时时间  |
| -------- | ------------- |
| 静态网站 | 5000ms        |
| 动态网站 | 10000ms       |
| 慢速网站 | 15000-30000ms |
| API接口  | 5000ms        |

### CSS选择器示例

| 选择器              | 描述                         |
| ------------------- | ---------------------------- |
| `article`           | 选择article标签              |
| `.content`          | 选择class为content的元素     |
| `#main`             | 选择id为main的元素           |
| `h1, h2, h3`        | 选择所有标题标签             |
| `p:first-child`     | 选择第一个p标签              |
| `div.post .content` | 选择div.post下的.content元素 |

## 性能考虑

### 1. 内存使用

- 大型页面可能消耗较多内存
- 建议对超大页面使用CSS选择器提取部分内容

### 2. 网络带宽

- 图片和媒体文件会增加下载时间
- 考虑使用选择器跳过不需要的内容

### 3. 并发限制

- 避免同时抓取大量页面
- 建议实现请求队列和限流机制

## 最佳实践

### 1. URL验证

始终验证URL格式的有效性。

### 2. 错误处理

实现完善的错误处理和重试机制。

### 3. 缓存策略

对于不经常变化的内容，考虑实现缓存。

### 4. 尊重robots.txt

检查目标网站的robots.txt文件。

### 5. 请求频率控制

避免对同一网站发送过于频繁的请求。
