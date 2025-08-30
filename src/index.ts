#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { URL } from 'url';

class CrawlPageServer {
  private server: Server;
  private turndownService: TurndownService;
  private debug: boolean;

  constructor() {
    this.debug = process.env.DEBUG === 'true';
    this.server = new Server(
      {
        name: 'crawl-page-mcp-server',
        version: '1.0.0',
      }
    );

    // 初始化 Turndown 服务
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    this.setupToolHandlers();
    this.debugLog('CrawlPageServer initialized');
  }

  private debugLog(...args: any[]) {
    if (this.debug) {
      console.error('[DEBUG]', new Date().toISOString(), ...args);
    }
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'crawl_page',
            description: '抓取指定URL的页面内容',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: '要抓取的网页URL地址',
                },
                format: {
                  type: 'string',
                  enum: ['html', 'text', 'markdown'],
                  default: 'markdown',
                  description: '输出格式：html(原始HTML)、text(纯文本)、markdown(Markdown格式)',
                },
                selector: {
                  type: 'string',
                  description: '可选的CSS选择器，用于提取页面特定部分的内容',
                },
                timeout: {
                  type: 'number',
                  default: 10000,
                  description: '请求超时时间（毫秒），默认10秒',
                },
                userAgent: {
                  type: 'string',
                  default: 'Mozilla/5.0 (compatible; CrawlPageMCP/1.0)',
                  description: '自定义User-Agent字符串',
                },
              },
              required: ['url'],
            },
          },
          {
            name: 'extract_links',
            description: '从指定URL页面中提取所有链接',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: '要分析的网页URL地址',
                },
                baseUrl: {
                  type: 'string',
                  description: '基础URL，用于解析相对链接',
                },
                filterPattern: {
                  type: 'string',
                  description: '可选的正则表达式模式，用于过滤链接',
                },
                timeout: {
                  type: 'number',
                  default: 10000,
                  description: '请求超时时间（毫秒），默认10秒',
                },
              },
              required: ['url'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      this.debugLog('Tool call received:', name, args);

      try {
        switch (name) {
          case 'crawl_page':
            return await this.crawlPage(args);
          case 'extract_links':
            return await this.extractLinks(args);
          default:
            throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        this.debugLog('Tool call error:', error);
        return {
          content: [
            {
              type: 'text',
              text: `错误: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async crawlPage(args: any) {
    const {
      url,
      format = 'markdown',
      selector,
      timeout = 10000,
      userAgent = 'Mozilla/5.0 (compatible; CrawlPageMCP/1.0)',
    } = args;

    // 验证URL
    try {
      new URL(url);
    } catch {
      throw new Error('无效的URL地址');
    }

    // 发送HTTP请求
    const response = await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 如果指定了选择器，只提取匹配的内容
    let content: string;
    const targetElement = selector ? $(selector) : $('body');

    if (targetElement.length === 0) {
      throw new Error(selector ? `未找到匹配选择器 "${selector}" 的元素` : '页面内容为空');
    }

    switch (format) {
      case 'html':
        content = targetElement.html() || '';
        break;
      case 'text':
        content = targetElement.text().trim();
        break;
      case 'markdown':
      default:
        const htmlContent = targetElement.html() || '';
        content = this.turndownService.turndown(htmlContent);
        break;
    }

    // 获取页面元数据
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            url,
            title,
            description,
            keywords,
            format,
            content,
            contentLength: content.length,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async extractLinks(args: any) {
    const {
      url,
      baseUrl,
      filterPattern,
      timeout = 10000,
    } = args;

    // 验证URL
    try {
      new URL(url);
    } catch {
      throw new Error('无效的URL地址');
    }

    // 发送HTTP请求
    const response = await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CrawlPageMCP/1.0)',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const links: Array<{ href: string; text: string; title?: string }> = [];

    $('a[href]').each((_, element) => {
      const $link = $(element);
      let href = $link.attr('href');
      const text = $link.text().trim();
      const title = $link.attr('title');

      if (!href) return;

      // 解析相对链接
      try {
        const resolvedUrl = new URL(href, baseUrl || url);
        href = resolvedUrl.href;
      } catch {
        // 如果无法解析，跳过这个链接
        return;
      }

      // 应用过滤模式
      if (filterPattern) {
        const regex = new RegExp(filterPattern);
        if (!regex.test(href)) return;
      }

      links.push({
        href,
        text,
        ...(title && { title }),
      });
    });

    // 去重
    const uniqueLinks = links.filter((link, index, self) =>
      index === self.findIndex(l => l.href === link.href)
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            url,
            totalLinks: uniqueLinks.length,
            links: uniqueLinks,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Crawl Page MCP Server 已启动');
  }
}

// 处理命令行参数
const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  console.log('crawl-page-mcp-server v1.0.0');
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Crawl Page MCP Server v1.0.0

用法:
  crawl-page-mcp                启动MCP服务器
  crawl-page-mcp --version      显示版本信息
  crawl-page-mcp --help         显示帮助信息

环境变量:
  DEBUG=true                    启用调试日志

更多信息请访问: https://github.com/your-username/crawl-page-mcp-server
`);
  process.exit(0);
}

const server = new CrawlPageServer();
server.run().catch(console.error);