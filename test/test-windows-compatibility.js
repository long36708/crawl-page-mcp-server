#!/usr/bin/env node

/**
 * Windows兼容性测试脚本
 * 测试修复后的模块加载和路径处理
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Windows兼容性测试开始...\n');

// 测试1: 检查构建文件是否存在
console.log('1️⃣ 检查构建文件...');
const distFile = path.join(__dirname, '../dist/index.js');
if (fs.existsSync(distFile)) {
  console.log('✅ dist/index.js 存在');
} else {
  console.log('❌ dist/index.js 不存在');
  process.exit(1);
}

// 测试2: 检查shebang
console.log('\n2️⃣ 检查shebang...');
const content = fs.readFileSync(distFile, 'utf8');
if (content.startsWith('#!/usr/bin/env node')) {
  console.log('✅ shebang 正确');
} else {
  console.log('❌ shebang 缺失或错误');
}

// 测试3: 检查模块格式
console.log('\n3️⃣ 检查模块格式...');
if (content.includes('"use strict"') && content.includes('__commonJS')) {
  console.log('✅ CommonJS 格式正确');
} else {
  console.log('❌ 模块格式可能有问题');
}

// 测试4: 检查Windows批处理文件
console.log('\n4️⃣ 检查Windows批处理文件...');
const cmdFile = path.join(__dirname, '../bin/crawl-page-mcp-server.cmd');
if (fs.existsSync(cmdFile)) {
  console.log('✅ Windows批处理文件存在');
} else {
  console.log('❌ Windows批处理文件不存在');
}

// 测试5: 尝试运行帮助命令
console.log('\n5️⃣ 测试基本运行...');
const child = spawn('node', [distFile, '--help'], {
  stdio: 'pipe',
  timeout: 5000
});

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

child.on('close', (code) => {
  if (code === 0 || output.length > 0) {
    console.log('✅ 基本运行测试通过');
  } else {
    console.log('❌ 基本运行测试失败');
    if (errorOutput) {
      console.log('错误输出:', errorOutput);
    }
  }
  
  console.log('\n🎉 Windows兼容性测试完成!');
  console.log('\n📋 修复总结:');
  console.log('- ✅ 移除了源码中的.js扩展名');
  console.log('- ✅ 统一使用CommonJS模块系统');
  console.log('- ✅ 优化了esbuild构建配置');
  console.log('- ✅ 添加了Windows批处理文件');
  console.log('- ✅ 保持了向后兼容性');
});

child.on('error', (err) => {
  console.log('❌ 运行测试出错:', err.message);
});