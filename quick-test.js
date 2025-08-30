const { spawn } = require('child_process');

console.log('🚀 快速测试MCP服务器...');

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
      url: 'https://httpbin.org/html', // 快速响应的测试URL
      format: 'text',
      timeout: 5000,
      useCache: false
    }
  }
};

let startTime = Date.now();

server.stdout.on('data', (data) => {
  const responseTime = Date.now() - startTime;
  console.log(`⏱️  响应时间: ${responseTime}ms`);
  console.log('📥 服务器响应:', data.toString().substring(0, 200) + '...');
  
  if (responseTime < 8000) {
    console.log('✅ 响应时间良好，超时优化有效');
  } else {
    console.log('⚠️  响应时间较长，可能仍有超时风险');
  }
  
  server.kill();
  process.exit(0);
});

server.stderr.on('data', (data) => {
  console.log('🔍 调试:', data.toString());
});

setTimeout(() => {
  console.log('📤 发送测试请求...');
  startTime = Date.now();
  server.stdin.write(JSON.stringify(testRequest) + '\n');
}, 1000);

// 10秒后强制退出
setTimeout(() => {
  console.log('❌ 测试超时，服务器可能存在问题');
  server.kill();
  process.exit(1);
}, 10000);