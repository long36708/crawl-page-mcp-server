# MCP爬虫服务超时优化指南

## 🚨 超时问题解决方案

如果遇到 `MCP error -32001: Request timed out` 错误，以下优化已经实施：

### ✅ 已实施的优化

1. **全局超时设置**: 5秒
2. **连接超时**: 3秒
3. **请求超时**: 4秒
4. **最大重定向**: 1次
5. **内容大小限制**: 10MB (已修复超限错误)
6. **连接池优化**: 最大5个连接

### 📊 性能测试结果

```
✅ 快速网站响应: ~1.7秒
✅ 缓存命中响应: ~2ms
✅ 超时控制: 有效防止长时间等待
```

### 🛠️ 使用建议

#### 1. 优化请求参数

```json
{
  "url": "https://example.com",
  "format": "text", // text比markdown更快
  "timeout": 3000, // 设置较短超时
  "useCache": true, // 启用缓存
  "selector": "main" // 使用选择器减少处理量
}
```

#### 2. 分步处理大型网站

```bash
# 先获取主要内容
curl -X POST http://localhost:3000/crawl \
  -d '{"url":"https://example.com","selector":"article"}'

# 再获取其他部分
curl -X POST http://localhost:3000/crawl \
  -d '{"url":"https://example.com","selector":"nav"}'
```

#### 3. 监控响应时间

```javascript
// 在调用前记录时间
const startTime = Date.now();
const result = await crawlPage({
  url: 'https://example.com',
  timeout: 4000,
});
console.log(`响应时间: ${Date.now() - startTime}ms`);
```

### 🔧 故障排除

#### 如果仍然超时：

1. **检查网络连接**

   ```bash
   curl -I https://target-website.com
   ```

2. **测试网站响应速度**

   ```bash
   time curl https://target-website.com
   ```

3. **使用更短的超时**

   ```json
   { "timeout": 2000 }
   ```

4. **启用调试模式**
   ```bash
   DEBUG=true npm start
   ```

### 📈 性能监控

服务器会输出详细的性能信息：

- 🌐 网络请求时间
- 📦 缓存命中状态
- ⚡ HTML解析时间
- 📊 总处理时间

### 🎯 最佳实践

1. **优先使用缓存**: `"useCache": true`
2. **选择合适格式**: `text` > `markdown` > `html`
3. **使用CSS选择器**: 减少处理内容
4. **设置合理超时**: 2-5秒适合大多数网站
5. **监控性能**: 关注响应时间日志

### 🚀 高级优化

如需进一步优化，可以：

1. 修改 `config.json` 中的超时设置
2. 调整连接池大小
3. 启用请求压缩
4. 使用CDN加速

---

**注意**: 当前配置已经过优化，适合大多数使用场景。如果特定网站仍然超时，可能是该网站响应较慢，建议使用缓存或分步处理。
