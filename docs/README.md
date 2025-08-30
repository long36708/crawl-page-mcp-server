# 文档目录

本目录包含了Crawl Page MCP Server的完整文档。

## 文档列表

### 📖 [API参考文档](api-reference.md)
详细的API接口说明，包括：
- 工具参数说明
- 输出格式定义
- 错误处理机制
- 配置选项说明

### 💡 [使用示例](examples.md)
丰富的使用示例，包括：
- 基本用法示例
- 实际应用场景
- 高级配置示例
- 最佳实践

### 🔧 [调试指南](debugging.md)
完整的调试方法和工具，包括：
- 交互式调试器使用
- VS Code调试配置
- 日志调试方法
- 性能调试技巧

### 🔍 [Inspector调试](inspector-debugging.md)
使用MCP Inspector进行可视化调试，包括：
- Inspector安装和配置
- 可视化界面使用
- 实时日志查看
- 测试用例管理

### 🚨 [故障排除](troubleshooting.md)
常见问题的解决方案，包括：
- 启动问题
- 网络连接问题
- 内容解析问题
- 性能问题

## 快速开始

### 1. 安装和构建
```bash
npm install
npm run build
```

### 2. 启动调试器
```bash
# 使用 MCP Inspector（推荐）
npm run inspector

# 或使用自定义调试器
npm run debug
```

### 3. 基本使用
```bash
# 在调试器中输入
list                           # 查看可用工具
crawl https://example.com      # 抓取网页
links https://example.com      # 提取链接
```

## 文档贡献

如果您发现文档中的错误或希望添加新的内容，请：

1. 创建issue描述问题或建议
2. 提交pull request改进文档
3. 遵循现有的文档格式和风格

## 文档更新日志

- **v1.0.0** - 初始文档版本
  - API参考文档
  - 使用示例
  - 调试指南
  - 故障排除指南

## 相关链接

- [项目主页](../README.md)
- [源代码](../src/)
- [示例代码](../examples/)
- [测试文件](../tests/)