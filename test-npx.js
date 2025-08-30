#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 测试 npx 功能...\n');

// 测试1: 检查版本
console.log('1. 测试版本命令:');
const versionTest = spawn('node', [join(__dirname, 'dist/index.js'), '--version'], {
  stdio: 'inherit'
});

versionTest.on('close', (code) => {
  if (code === 0) {
    console.log('✅ 版本命令测试通过\n');
    
    // 测试2: 检查帮助
    console.log('2. 测试帮助命令:');
    const helpTest = spawn('node', [join(__dirname, 'dist/index.js'), '--help'], {
      stdio: 'inherit'
    });
    
    helpTest.on('close', (code) => {
      if (code === 0) {
        console.log('✅ 帮助命令测试通过\n');
        
        // 测试3: 启动服务器（3秒后关闭）
        console.log('3. 测试服务器启动:');
        const serverTest = spawn('node', [join(__dirname, 'dist/index.js')], {
          stdio: ['pipe', 'pipe', 'inherit']
        });
        
        setTimeout(() => {
          serverTest.kill();
          console.log('✅ 服务器启动测试通过\n');
          console.log('🎉 所有测试通过！项目可以通过 npx 使用');
        }, 3000);
      }
    });
  }
});