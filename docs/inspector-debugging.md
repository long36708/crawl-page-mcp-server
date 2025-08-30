# 使用 MCP Inspector 调试

MCP Inspector 是官方提供的可视化调试工具，提供了比命令行更友好的调试界面。

## 安装和启动

### 1. 确保项目已构建
```bash
npm run build
```

### 2. 启动 MCP Inspector
```bash
npx @modelcontextprotocol/inspector
```

### 3. 在浏览器中打开
Inspector 会自动在浏览器中打开调试界面，通常是 `http://localhost:5173`

## 配置服务器

### 方法1：使用配置文件

1. 在 Inspector 界面中点击 "Add Server"
2. 选择 "From Config File"
3. 选择项目根目录下的 `inspector-config.json` 文件

### 方法2：手动配置

在 Inspector 界面中手动添加服务器：

**服务器名称：** `crawl-page`

**命令配置：**
- **Command:** `node`
- **Args:** `["./dist/index.js"]`
- **Working Directory:** `/Users/longmo/code/crawl-page-mcp-server`
- **Environment Variables:** `{"DEBUG": "true"}`

### 方法3：使用 npx 版本

如果项目已发布到 npm：

**命令配置：**
- **Command:** `npx`
- **Args:** `["crawl-page-mcp-server"]`
- **Environment Variables:** `{"DEBUG": "true"}`

## 使用 Inspector 调试

### 1. 连接服务器

1. 在 Inspector 界面中找到 `crawl-page` 服务器
2. 点击 "Connect" 按钮
3. 等待连接成功（状态变为绿色）

### 2. 查看工具列表

连接成功后，Inspector 会自动显示：
- 可用工具列表（crawl_page, extract_links）
- 每个工具的详细参数说明
- 输入输出格式定义

### 3. 测试工具功能

#### 测试 crawl_page 工具

1. 在左侧工具列表中选择 `crawl_page`
2. 在右侧参数面板中输入：
   ```json
   {
     "url": "https://httpbin.org/html",
     "format": "markdown"
   }
   ```
3. 点击 "Call Tool" 按钮
4. 查看右侧的响应结果

#### 测试 extract_links 工具

1. 选择 `extract_links` 工具
2. 输入参数：
   ```json
   {
     "url": "https://httpbin.org/links/5"
   }
   ```
3. 执行并查看结果

### 4. 实时日志查看

Inspector 提供实时日志功能：
- 在 "Logs" 标签页中查看服务器日志
- 可以看到详细的调试信息（如果启用了 DEBUG=true）
- 包括请求/响应的完整信息

### 5. 错误调试

当工具调用失败时：
1. 查看 "Logs" 标签页中的错误信息
2. 检查参数格式是否正确
3. 验证网络连接和URL有效性

## 高级调试功能

### 1. 参数验证

Inspector 会自动验证输入参数：
- 必需参数检查
- 数据类型验证
- 枚举值验证

### 2. 响应格式化

Inspector 自动格式化响应内容：
- JSON 语法高亮
- 可折叠的对象结构
- 错误信息突出显示

### 3. 历史记录

Inspector 保存调用历史：
- 查看之前的工具调用
- 重复执行相同的调用
- 比较不同参数的结果

## 常见调试场景

### 1. 测试不同的URL

```json
// 测试简单HTML页面
{
  "url": "https://httpbin.org/html",
  "format": "markdown"
}

// 测试新闻网站
{
  "url": "https://news.ycombinator.com",
  "format": "text",
  "selector": ".storylink"
}

// 测试超时处理
{
  "url": "https://httpbin.org/delay/5",
  "timeout": 3000
}
```

### 2. 测试CSS选择器

```json
// 测试不同的选择器
{
  "url": "https://httpbin.org/html",
  "format": "markdown",
  "selector": "h1"
}

{
  "url": "https://httpbin.org/html",
  "format": "text",
  "selector": "p"
}
```

### 3. 测试链接提取

```json
// 基本链接提取
{
  "url": "https://httpbin.org/links/10"
}

// 使用过滤模式
{
  "url": "https://httpbin.org/links/10",
  "filterPattern": ".*\\/links\\/.*"
}
```

## 性能监控

Inspector 提供性能监控功能：
- 工具调用耗时统计
- 内存使用情况
- 网络请求时间分析

## 故障排除

### 1. 连接失败

如果无法连接到服务器：
1. 检查项目是否已构建：`npm run build`
2. 验证配置文件路径是否正确
3. 查看 Inspector 控制台错误信息

### 2. 工具调用失败

如果工具调用失败：
1. 检查参数格式是否正确
2. 查看服务器日志中的错误信息
3. 验证网络连接和URL有效性

### 3. 响应异常

如果响应内容异常：
1. 检查目标网站是否可访问
2. 验证CSS选择器是否有效
3. 尝试不同的User-Agent设置

## 与其他调试工具对比

| 功能 | MCP Inspector | 自定义调试器 | VS Code调试 |
|------|---------------|--------------|-------------|
| 可视化界面 | ✅ | ❌ | ✅ |
| 实时日志 | ✅ | ✅ | ✅ |
| 参数验证 | ✅ | ❌ | ❌ |
| 历史记录 | ✅ | ❌ | ❌ |
| 响应格式化 | ✅ | ❌ | ❌ |
| 断点调试 | ❌ | ❌ | ✅ |
| 性能监控 | ✅ | ❌ | ✅ |

## 最佳实践

### 1. 开发流程

1. 使用 Inspector 进行功能测试
2. 使用 VS Code 调试器进行代码调试
3. 使用自定义调试器进行批量测试

### 2. 调试策略

1. 先用简单的URL测试基本功能
2. 逐步增加复杂度（CSS选择器、超时等）
3. 测试边界情况和错误处理

### 3. 问题定位

1. 使用 Inspector 确认问题现象
2. 查看详细日志定位问题原因
3. 使用断点调试深入分析代码

## 扩展功能

### 1. 自定义配置

可以创建多个配置文件用于不同的测试场景：

```bash
# 开发环境配置
inspector-dev.json

# 生产环境配置
inspector-prod.json

# 测试环境配置
inspector-test.json
```

### 2. 批量测试

结合 Inspector 和脚本进行批量测试：

```javascript
// 使用 Inspector API 进行自动化测试
const testCases = [
  { url: "https://example1.com", format: "markdown" },
  { url: "https://example2.com", format: "text" },
  // ...
];

// 批量执行测试用例
```

### 3. 集成到CI/CD

将 Inspector 集成到持续集成流程中：

```yaml
# GitHub Actions 示例
- name: Test MCP Server
  run: |
    npm run build
    npx @modelcontextprotocol/inspector --config inspector-config.json --test