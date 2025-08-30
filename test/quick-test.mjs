import { spawn } from 'child_process';

console.log('🚀 快速测试MCP服务器超时优化...');

const server = spawn('node', ['./dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'crawl_page',
    arguments: {
      url: 'https://httpbin.org/html',
      format: 'text',
      timeout: 4000,
      useCache: false
    }
  }
};

let startTime = Date.now();

server.stdout.on('data', (data) => {
  const responseTime = Date.now() - startTime;
  console.log(`⏱️  响应时间: ${responseTime}ms`);
  
  const response = data.toString();
  if (response.includes('error') || response.includes('timeout')) {
    console.log('❌ 请求失败:', response.substring(0, 200));
  } else {
    console.log('✅ 请求成功，超时优化有效');
  }
  
  server.kill();
  process.exit(0);
});

server.stderr.on('data', (data) => {
  console.log('🔍 调试信息:', data.toString());
});

setTimeout(() => {
  console.log('📤 发送测试请求...');
  startTime = Date.now();
  server.stdin.write(JSON.stringify(testRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('❌ 测试超时');
  server.kill();
  process.exit(1);
}, 10000);