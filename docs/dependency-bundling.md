# 依赖打包解决方案

## 问题背景

在开发 MCP 服务器时，我们遇到了一个关键问题：**打包后的文件没有将第三方依赖打包进去**。

### 问题表现
- TypeScript 编译后的代码仍然使用 `require()` 引用外部依赖
- 用户需要单独安装 axios、cheerio、turndown 等依赖
- 部署复杂，容易出现依赖版本冲突

## 解决方案对比

### 方案一：使用 tsx（❌ 不可行）
```bash
# tsx 只是 TypeScript 运行时工具
npm run dev  # tsx src/index.ts
```

**问题**：
- tsx 不是打包工具，无法将依赖打包
- 只能用于开发时直接运行 .ts 文件
- 编译后仍然是外部依赖引用

### 方案二：使用 tsc（❌ 不完整）
```bash
# TypeScript 编译器
npm run build  # tsc
```

**问题**：
- tsc 只编译 TypeScript，不打包依赖
- 生成的 .js 文件仍然使用 require() 引用外部模块
- 用户仍需安装所有依赖

### 方案三：使用 esbuild（✅ 最终方案）
```bash
# esbuild 打包工具
npm run build  # esbuild + shebang处理
```

**优势**：
- 真正的打包工具，能将依赖打包到单个文件
- 支持 Tree Shaking，优化文件大小
- 生成可直接执行的文件

## 最终实现

### package.json 配置
```json
{
  "scripts": {
    "build": "npm run build:bundle",
    "build:bundle": "esbuild src/index.ts --bundle --platform=node --target=node18 --format=cjs --outfile=dist/index.js --external:@modelcontextprotocol/sdk && node scripts/add-shebang.js",
    "dev": "tsx src/index.ts"
  },
  "devDependencies": {
    "esbuild": "^0.25.9",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

### esbuild 配置说明
- `--bundle`: 打包所有依赖
- `--platform=node`: 目标平台为 Node.js
- `--target=node18`: 目标 Node.js 版本
- `--format=cjs`: 输出 CommonJS 格式
- `--external:@modelcontextprotocol/sdk`: 保持 MCP SDK 为外部依赖

### Shebang 处理脚本
```javascript
// scripts/add-shebang.js
const fs = require('fs');

const content = fs.readFileSync('dist/index.js', 'utf8');
const cleanContent = content.replace(/^#!.*\n?/, '');
const finalContent = '#!/usr/bin/env node\n' + cleanContent;

fs.writeFileSync('dist/index.js', finalContent);
console.log('Shebang added successfully!');
```

## 打包结果

### 文件信息
- **大小**: 3.0MB
- **格式**: CommonJS with shebang
- **权限**: 可执行 (`chmod +x`)
- **依赖**: 仅需 @modelcontextprotocol/sdk

### 包含的依赖
- ✅ axios (HTTP 客户端)
- ✅ cheerio (HTML 解析)
- ✅ turndown (HTML 转 Markdown)
- ✅ url (URL 处理)
- ❌ @modelcontextprotocol/sdk (外部依赖)

## 用户体验改进

### 安装前（有问题）
```bash
npx crawl-page-mcp-server
# 错误：找不到 axios、cheerio 等模块
```

### 安装后（已解决）
```bash
npx crawl-page-mcp-server
# ✅ 正常运行，所有依赖已打包
```

## 开发工作流

### 开发阶段
```bash
# 使用 tsx 直接运行源码，快速开发
npm run dev
```

### 构建阶段
```bash
# 使用 esbuild 打包所有依赖
npm run build
```

### 测试阶段
```bash
# 测试打包后的文件
./dist/index.js --help
node dist/index.js --version
```

## 总结

通过使用 esbuild 作为打包工具，我们成功解决了依赖打包问题：

1. **开发体验**: tsx 提供快速的开发时运行
2. **构建优化**: esbuild 提供高效的依赖打包
3. **用户体验**: 单文件部署，无需额外依赖安装
4. **维护性**: 清晰的构建流程和配置

这种方案在保持开发效率的同时，大大改善了最终用户的使用体验。