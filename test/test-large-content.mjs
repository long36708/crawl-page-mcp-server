import { spawn } from 'child_process';

console.log('🧪 测试大内容处理...');

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
      url: 'https://en.wikipedia.org/wiki/Artificial_intelligence', // 大型页面
      format: 'text',
      timeout: 8000,
      useCache: false,
      selector: 'main' // 限制内容范围
    }
  }
};

let startTime = Date.now();

server.stdout.on('data', (data) => {
  const responseTime = Date.now() - startTime;
  const response = data.toString();
  
  console.log(`⏱️  响应时间: ${responseTime}ms`);
  
  if (response.includes('maxContentLength') || response.includes('exceeded')) {
    console.log('❌ 内容大小仍然超限');
    console.log('响应:', response.substring(0, 300));
  } else if (response.includes('error')) {
    console.log('⚠️  其他错误:', response.substring(0, 200));
  } else {
    console.log('✅ 大内容处理成功');
    // 解析响应获取内容长度
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (result.content && result.content[0] && result.content[0].text) {
          const contentData = JSON.parse(result.content[0].text);
          console.log(`📄 内容长度: ${contentData.contentLength || 'N/A'} 字符`);
        }
      }
    } catch (e) {
      console.log('📊 响应解析完成');
    }
  }
  
  server.kill();
  process.exit(0);
});

server.stderr.on('data', (data) => {
  console.log('🔍 调试:', data.toString());
});

setTimeout(() => {
  console.log('📤 发送大内容测试请求...');
  startTime = Date.now();
  server.stdin.write(JSON.stringify(testRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('❌ 测试超时');
  server.kill();
  process.exit(1);
}, 15000);