#!/usr/bin/env node

import { spawn } from 'node:child_process';

console.log('🚀 性能测试开始...\n');

const testCases = [
  {
    expectedTime: 3000,
    format: 'markdown',
    name: '快速HTML页面',
    url: 'https://httpbin.org/html',
  },
  {
    expectedTime: 2000,
    format: 'text',
    name: '大型页面（文本模式）',
    url: 'https://httpbin.org/html',
  },
  {
    expectedTime: 2500,
    format: 'markdown',
    name: '使用CSS选择器',
    selector: 'h1',
    url: 'https://httpbin.org/html',
  },
  {
    expectedTime: 100,
    format: 'markdown',
    name: '缓存测试（第二次请求）',
    url: 'https://httpbin.org/html',
  },
];

async function runPerformanceTest() {
  const server = spawn('node', ['dist/index.js'], {
    env: { ...process.env, DEBUG: 'true' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let requestId = 1;

  // 初始化
  const initRequest = {
    id: requestId++,
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      capabilities: {},
      clientInfo: { name: 'perf-test', version: '1.0.0' },
      protocolVersion: '2024-11-05',
    },
  };
  server.stdin.write(`${JSON.stringify(initRequest)}\n`);

  // 等待初始化
  await new Promise((resolve) => setTimeout(resolve, 1000));

  for (const testCase of testCases) {
    console.log(`📊 测试: ${testCase.name}`);

    const startTime = Date.now();

    const crawlRequest = {
      id: requestId++,
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        arguments: {
          format: testCase.format,
          url: testCase.url,
          ...(testCase.selector && { selector: testCase.selector }),
        },
        name: 'crawl_page',
      },
    };

    server.stdin.write(`${JSON.stringify(crawlRequest)}\n`);

    // 等待响应
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log(`⏰ 超时 (>${testCase.expectedTime}ms)`);
        resolve();
      }, testCase.expectedTime + 2000);

      server.stdout.once('data', (data) => {
        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;

        try {
          const response = JSON.parse(data.toString().split('\n')[0]);
          if (response.result) {
            const result = JSON.parse(response.result.content[0].text);
            console.log(
              `✅ 完成: ${responseTime}ms (期望: <${testCase.expectedTime}ms)`,
            );
            console.log(`   内容长度: ${result.contentLength} 字符`);
            if (result.fromCache) {
              console.log(`   📦 来自缓存`);
            }
            if (result.requestTime) {
              console.log(`   🌐 网络请求: ${result.requestTime}ms`);
            }
          }
        } catch (error) {
          console.log(`❌ 解析响应失败: ${error.message}`);
        }

        resolve();
      });
    });

    console.log('');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  server.kill();
  console.log('🎉 性能测试完成');
}

runPerformanceTest().catch(console.error);
