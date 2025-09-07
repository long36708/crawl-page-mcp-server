# Release Notes v1.0.4

## 🚀 新版本发布

### 📦 依赖打包优化

- ✅ **完善文档**: 详细说明了依赖打包的技术方案
- ✅ **技术澄清**: 明确了tsx、tsc、esbuild的不同作用
- ✅ **用户指南**: 更新了README和技术文档

### 📚 文档更新

- 新增 `docs/dependency-bundling.md` - 完整的依赖打包技术文档
- 更新 `README.md` - 添加依赖打包说明章节
- 完善 `BUNDLE-FIX-SUMMARY.md` - 修正技术细节

### 🔧 技术细节

- **打包工具**: esbuild (不是tsx)
- **文件大小**: 3.0MB (包含所有依赖)
- **外部依赖**: 仅@modelcontextprotocol/sdk
- **用户体验**: 一键安装，无需额外依赖

### 📖 关键澄清

**为什么使用esbuild？**

- `tsx`: 仅为TypeScript运行时工具，不能打包依赖
- `tsc`: TypeScript编译器，只编译不打包
- `esbuild`: 真正的打包工具，将依赖打包到单个文件

### 🎯 用户收益

- ✅ 使用更简单：`npx crawl-page-mcp-server`
- ✅ 部署更容易：单文件包含所有依赖
- ✅ 冲突更少：避免依赖版本问题
- ✅ 性能更好：减少模块解析时间

## 📦 安装使用

```bash
# 直接使用最新版本
npx crawl-page-mcp-server@latest

# 或全局安装
npm install -g crawl-page-mcp-server@latest
```

## 🔗 相关链接

- [GitHub Repository](https://github.com/long36708/crawl-page-mcp-server)
- [NPM Package](https://www.npmjs.com/package/crawl-page-mcp-server)
- [技术文档](./docs/dependency-bundling.md)

---

**发布时间**: 2025-08-31  
**版本**: v1.0.4  
**主要改进**: 文档完善和技术澄清
