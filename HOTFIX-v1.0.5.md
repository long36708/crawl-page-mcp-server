# Hotfix v1.0.5

## 🚨 紧急修复

### 问题描述
- `postinstall` 脚本导致 `npx` 使用时报错
- 用户使用 `npx crawl-page-mcp-server` 时会尝试运行构建脚本
- 但 `npx` 安装时可能没有 devDependencies（如 esbuild）
- 导致构建失败，用户无法正常使用

### 修复方案
移除 `postinstall` 脚本，因为：
1. **发布时已构建**: `prepublishOnly` 确保发布前已构建
2. **用户无需构建**: 用户直接使用预构建的 `dist/index.js`
3. **避免依赖问题**: 不强制用户安装 devDependencies

### 修改内容
```diff
- "postinstall": "npm run build"
```

### 验证方法
```bash
# 现在可以正常使用
npx crawl-page-mcp-server@latest --help
```

## ✅ 修复结果
- ✅ 移除了有问题的 `postinstall` 脚本
- ✅ 保留 `prepublishOnly` 确保发布前构建
- ✅ 用户可以正常使用 `npx` 命令
- ✅ 不再强制安装 devDependencies

## 📦 使用方式
```bash
# 直接使用（推荐）
npx crawl-page-mcp-server

# 全局安装
npm install -g crawl-page-mcp-server
```

---
**版本**: v1.0.5  
**修复时间**: 2025-08-31  
**修复类型**: 紧急修复 (Hotfix)