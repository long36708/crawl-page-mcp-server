#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🧪 快速调试测试...\n');

// 启动服务器
const server = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, DEBUG: 'true' }
});

let requestId = 1;

// 监听输出
server.stdout.on('data', (data) => {
  console.log('📥 服务器响应:', data.toString());
});

server.stderr.on('data', (data) => {
  console.log('🔍 调试日志:', data.toString());
});

// 发送测试请求
setTimeout(() => {
  console.log('📤 发送初始化请求...');
  const initRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };
  server.stdin.write(JSON.stringify(initRequest) + '\n');
}, 500);

setTimeout(() => {
  console.log('📤 发送工具列表请求...');
  const listRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/list',
    params: {}
  };
  server.stdin.write(JSON.stringify(listRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('📤 发送抓取请求...');
  const crawlRequest = {
    jsonrpc: '2.0',
    id: requestId++,
    method: 'tools/call',
    params: {
      name: 'crawl_page',
      arguments: {
        url: 'https://httpbin.org/html',
        format: 'markdown'
      }
    }
  };
  server.stdin.write(JSON.stringify(crawlRequest) + '\n');
}, 1500);

// 5秒后结束测试
setTimeout(() => {
  console.log('\n✅ 调试测试完成');
  server.kill();
  process.exit(0);
}, 5000);