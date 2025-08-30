#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';

/**
 * MCP服务器调试工具
 * 用于交互式测试MCP服务器功能
 */
class MCPDebugger {
  constructor() {
    this.requestId = 1;
    this.server = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🚀 启动MCP服务器调试器...\n');
    
    // 启动MCP服务器
    this.server = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 监听服务器输出
    this.server.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        try {
          const response = JSON.parse(line);
          console.log('📥 服务器响应:');
          console.log(JSON.stringify(response, null, 2));
          console.log('---\n');
        } catch (e) {
          console.log('📄 服务器输出:', line);
        }
      });
    });

    this.server.stderr.on('data', (data) => {
      console.log('🔍 服务器日志:', data.toString());
    });

    // 发送初始化请求
    await this.initialize();
    
    // 启动交互式命令行
    this.startInteractive();
  }

  async initialize() {
    console.log('📡 发送初始化请求...');
    const initRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'debug-client',
          version: '1.0.0'
        }
      }
    };

    this.sendRequest(initRequest);
  }

  sendRequest(request) {
    const requestStr = JSON.stringify(request);
    console.log('📤 发送请求:');
    console.log(JSON.stringify(request, null, 2));
    console.log('---');
    
    this.server.stdin.write(requestStr + '\n');
  }

  startInteractive() {
    console.log(`
🎯 调试命令:
1. list - 列出所有可用工具
2. crawl <url> [format] [selector] - 抓取网页
3. links <url> [pattern] - 提取链接
4. test - 运行测试用例
5. help - 显示帮助
6. exit - 退出调试器

请输入命令:`);

    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });
  }

  handleCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case 'list':
        this.listTools();
        break;
      case 'crawl':
        this.crawlPage(parts.slice(1));
        break;
      case 'links':
        this.extractLinks(parts.slice(1));
        break;
      case 'test':
        this.runTests();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'exit':
        this.exit();
        break;
      default:
        console.log('❌ 未知命令，输入 help 查看帮助');
    }
    
    if (cmd !== 'exit') {
      console.log('\n请输入下一个命令:');
    }
  }

  listTools() {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/list',
      params: {}
    };
    this.sendRequest(request);
  }

  crawlPage(args) {
    if (args.length === 0) {
      console.log('❌ 请提供URL地址');
      console.log('用法: crawl <url> [format] [selector]');
      return;
    }

    const [url, format = 'markdown', selector] = args;
    const arguments_ = { url, format };
    
    if (selector) {
      arguments_.selector = selector;
    }

    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'crawl_page',
        arguments: arguments_
      }
    };
    this.sendRequest(request);
  }

  extractLinks(args) {
    if (args.length === 0) {
      console.log('❌ 请提供URL地址');
      console.log('用法: links <url> [pattern]');
      return;
    }

    const [url, filterPattern] = args;
    const arguments_ = { url };
    
    if (filterPattern) {
      arguments_.filterPattern = filterPattern;
    }

    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method: 'tools/call',
      params: {
        name: 'extract_links',
        arguments: arguments_
      }
    };
    this.sendRequest(request);
  }

  runTests() {
    console.log('🧪 运行测试用例...\n');
    
    // 测试1: 抓取简单HTML页面
    setTimeout(() => {
      console.log('测试1: 抓取HTML页面转Markdown');
      this.crawlPage(['https://httpbin.org/html', 'markdown']);
    }, 1000);

    // 测试2: 提取链接
    setTimeout(() => {
      console.log('测试2: 提取页面链接');
      this.extractLinks(['https://httpbin.org/links/5']);
    }, 3000);

    // 测试3: 使用选择器
    setTimeout(() => {
      console.log('测试3: 使用CSS选择器');
      this.crawlPage(['https://httpbin.org/html', 'text', 'h1']);
    }, 5000);
  }

  showHelp() {
    console.log(`
🎯 MCP服务器调试器帮助

基本命令:
  list                          - 列出所有可用工具
  crawl <url> [format] [selector] - 抓取网页内容
    format: html, text, markdown (默认: markdown)
    selector: CSS选择器 (可选)
  links <url> [pattern]         - 提取页面链接
    pattern: 正则表达式过滤模式 (可选)
  test                          - 运行预设测试用例
  help                          - 显示此帮助信息
  exit                          - 退出调试器

示例:
  crawl https://example.com
  crawl https://example.com markdown article
  links https://example.com
  links https://example.com ".*\\.pdf$"
`);
  }

  exit() {
    console.log('👋 退出调试器...');
    if (this.server) {
      this.server.kill();
    }
    this.rl.close();
    process.exit(0);
  }
}

// 启动调试器
const mcpDebugger = new MCPDebugger();
mcpDebugger.start().catch(console.error);