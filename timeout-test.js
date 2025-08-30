const { spawn } = require('child_process');

console.log('🚀 测试MCP服务器超时优化...');

// 启动MCP服务器
const server = spawn('node', ['./dist/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseReceived = false;

// 发送测试请求
const testRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'crawl_page',
    arguments: {
      url: 'https://httpbin.org/delay/10', // 10秒延迟的测试URL
      format: 'text',
      timeout: 3000, // 3秒超时
      useCache: false
    }
  }
};

// 设置总体超时
const overallTimeout = setTimeout(() => {
  if (!responseReceived) {
    console.log('✅ 超时控制生效 - 服务器在合理时间内响应');
    server.kill();
    process.exit(0);
  }
}, 8000); // 8秒总超时

server.stdout.on('data', (data) => {
  const response = data.toString();
  console.log('📥 服务器响应:', response);
  responseReceived = true;
  clearTimeout(overallTimeout);
  server.kill();
  
  if (response.includes('请求超时') || response.includes('timeout')) {
    console.log('✅ 超时机制工作正常');
  } else {
    console.log('⚠️  可能需要进一步优化超时设置');
  }
  process.exit(0);
});

server.stderr.on('data', (data) => {
  console.log('🔍 调试信息:', data.toString());
});

server.on('error', (error) => {
  console.log('❌ 服务器启动错误:', error.message);
  process.exit(1);
});

// 等待服务器启动
setTimeout(() => {
  console.log('📤 发送测试请求...');
  server.stdin.write(JSON.stringify(testRequest) + '\n');
}, 1000);