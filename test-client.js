import { spawn } from 'child_process';
import { createReadStream, createWriteStream } from 'fs';

// 简单的MCP客户端测试
class MCPTestClient {
  constructor() {
    this.requestId = 1;
  }

  async testCrawlPage() {
    console.log('测试 crawl_page 工具...');
    
    const server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    // 发送初始化请求
    const initRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    server.stdin.write(JSON.stringify(initRequest) + '\n');

    // 发送工具列表请求
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/list',
      params: {}
    };

    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

    // 发送抓取页面请求
    const crawlRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
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

    // 监听响应
    server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        try {
          const response = JSON.parse(line);
          console.log('收到响应:', JSON.stringify(response, null, 2));
        } catch (e) {
          console.log('原始输出:', line);
        }
      });
    });

    // 3秒后关闭
    setTimeout(() => {
      server.kill();
      console.log('测试完成');
    }, 3000);
  }
}

const client = new MCPTestClient();
client.testCrawlPage().catch(console.error);