#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 发布前检查...\n');

const checks = [
  {
    name: '检查 package.json',
    check: () => {
      const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
      return pkg.bin && pkg.bin['crawl-page-mcp'] && pkg.files;
    }
  },
  {
    name: '检查构建文件',
    check: () => existsSync('dist/index.js')
  },
  {
    name: '检查可执行权限',
    check: () => {
      try {
        const stats = readFileSync('dist/index.js', 'utf8');
        return stats.startsWith('#!/usr/bin/env node');
      } catch {
        return false;
      }
    }
  },
  {
    name: '检查调试器',
    check: () => existsSync('debug-server.js')
  },
  {
    name: '检查文档',
    check: () => existsSync('docs/README.md') && existsSync('README.md')
  }
];

let allPassed = true;

for (const { name, check } of checks) {
  try {
    const passed = check();
    console.log(passed ? `✅ ${name}` : `❌ ${name}`);
    if (!passed) allPassed = false;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    allPassed = false;
  }
}

console.log('\n' + (allPassed ? '🎉 所有检查通过，可以发布！' : '⚠️  存在问题，请修复后再发布'));

if (allPassed) {
  console.log(`
📦 发布命令:
  npm publish

🚀 使用方法:
  npx crawl-page-mcp-server
  npm install -g crawl-page-mcp-server
`);
}

process.exit(allPassed ? 0 : 1);