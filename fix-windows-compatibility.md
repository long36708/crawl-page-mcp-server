# Windows兼容性修复方案

## 🚨 问题诊断

### 主要问题

1. **模块系统混合**: 源码ES modules + 构建CommonJS + TypeScript ESNext配置
2. **Windows路径问题**: 反斜杠路径分隔符可能导致模块解析失败
3. **Shebang兼容性**: Windows对shebang处理不同
4. **依赖解析**: MCP SDK的.js扩展名在CommonJS环境下可能失败

## 🛠️ 修复方案

### 方案1: 完全CommonJS化 (推荐)

#### 1.1 修改源码导入语句

```typescript
// 将 src/index.ts 中的导入改为:
import { Server } from '@modelcontextprotocol/sdk/server/index';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types';
```

#### 1.2 更新TypeScript配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS", // 改为CommonJS
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

#### 1.3 优化构建脚本

```json
{
  "scripts": {
    "build:bundle": "esbuild src/index.ts --bundle --platform=node --target=node18 --format=cjs --outfile=dist/index.js --external:@modelcontextprotocol/sdk --resolve-extensions=.ts,.js --main-fields=main,module && node scripts/add-shebang.js"
  }
}
```

### 方案2: 纯ES Modules

#### 2.1 修改package.json

```json
{
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build:bundle": "esbuild src/index.ts --bundle --platform=node --target=node18 --format=esm --outfile=dist/index.js --external:@modelcontextprotocol/sdk && node scripts/add-shebang.js"
  }
}
```

#### 2.2 更新shebang脚本

```javascript
// scripts/add-shebang.js 改为ES module
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ... 其余代码
```

### 方案3: Windows特定修复

#### 3.1 添加Windows检测

```typescript
// 在src/index.ts中添加
const isWindows = process.platform === 'win32';

// 路径处理函数
function normalizePath(filePath: string): string {
  return isWindows ? filePath.replace(/\\/g, '/') : filePath;
}
```

#### 3.2 创建Windows启动脚本

```batch
@echo off
REM bin/crawl-page-mcp-server.cmd
node "%~dp0../dist/index.js" %*
```

## 🎯 推荐实施步骤

1. **立即修复** (方案1):
   - 移除源码中的.js扩展名
   - 更新tsconfig.json为CommonJS
   - 测试Windows环境

2. **长期优化**:
   - 添加Windows特定测试
   - 考虑双格式发布(CJS+ESM)
   - 添加跨平台CI测试

## 🧪 测试验证

```bash
# Windows测试命令
npm run build
node dist/index.js --help

# 跨平台测试
npm test
npm run test:performance
```

## 📦 发布建议

- 版本号: v1.0.6
- 修复类型: Windows兼容性修复
- 向后兼容: 是
- 破坏性变更: 无
