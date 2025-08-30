#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { URL } from 'url';
import { Agent } from 'http';
import { Agent as HttpsAgent } from 'https';

class CrawlPageServer {
  private server: Server;
  private turndownService: TurndownService;
  private debug: boolean;
  private axiosInstance: AxiosInstance;
  private cache: Map<string, { content: any; timestamp: number; ttl: number }>;

  constructor() {
    this.debug = process.env.DEBUG === 'true';
    
    // 初始化缓存
    this.cache = new Map();
    
    // 创建优化的 axios 实例
    this.axiosInstance = axios.create({
      // 连接池配置
      httpAgent: new Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 5,
        maxFreeSockets: 2,
        timeout: 3000, // 连接超时3秒
      }),
      httpsAgent: new HttpsAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 5,
        maxFreeSockets: 2,
        timeout: 3000, // 连接超时3秒
      }),
      // 全局配置
      timeout: 5000, // 进一步减少到5秒超时
      maxRedirects: 1, // 最多1次重定向
      maxContentLength: 10 * 1024 * 1024, // 增加到10MB限制
      validateStatus: (status) => status < 500, // 接受4xx状态码
    });
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

  private getCacheKey(url: string, format: string, selector?: string): string {
    return `${url}:${format}:${selector || 'default'}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    this.debugLog(`Cache hit for key: ${key}`);
    return cached.content;
  }

  private setCache(key: string, content: any, ttl: number = 300000): void { // 默认5分钟TTL
    this.cache.set(key, {
      content,
      timestamp: Date.now(),
      ttl
    });
    this.debugLog(`Cached content for key: ${key}`);
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
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
                useCache: {
                  type: 'boolean',
                  default: true,
                  description: '是否使用缓存（默认5分钟TTL）',
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
      useCache = true,
    } = args;

    // 验证URL
    try {
      new URL(url);
    } catch {
      throw new Error('无效的URL地址');
    }

    // 检查缓存
    const cacheKey = this.getCacheKey(url, format, selector);
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                ...cached,
                fromCache: true,
              }, null, 2),
            },
          ],
        };
      }
    }

    // 清理过期缓存
    this.clearExpiredCache();

    // 发送HTTP请求 - 优化版本，添加严格超时控制
    const startTime = Date.now();
    const effectiveTimeout = Math.min(timeout, 6000); // 最大6秒
    
    // 创建超时Promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`请求超时: ${effectiveTimeout}ms`)), effectiveTimeout);
    });
    
    // 创建请求Promise
    const requestPromise = this.axiosInstance.get(url, {
      timeout: effectiveTimeout,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    // 使用Promise.race确保严格超时
    const response = await Promise.race([requestPromise, timeoutPromise]);
    
    const requestTime = Date.now() - startTime;
    this.debugLog(`HTTP request completed in ${requestTime}ms`);

    const html = response.data;
    
    // 优化的HTML解析
    const parseStartTime = Date.now();
    const $ = cheerio.load(html, {
      // 优化选项
      xmlMode: false,
    });
    
    // 如果指定了选择器，只提取匹配的内容
    let content: string;
    const targetElement = selector ? $(selector) : $('body');

    if (targetElement.length === 0) {
      throw new Error(selector ? `未找到匹配选择器 "${selector}" 的元素` : '页面内容为空');
    }

    // 优化内容提取
    switch (format) {
      case 'html':
        content = targetElement.html() || '';
        break;
      case 'text':
        // 移除脚本和样式标签以提高性能
        targetElement.find('script, style, noscript').remove();
        content = targetElement.text().replace(/\s+/g, ' ').trim();
        break;
      case 'markdown':
      default:
        // 移除不需要的元素以提高转换速度
        targetElement.find('script, style, noscript, iframe, embed, object').remove();
        const htmlContent = targetElement.html() || '';
        content = this.turndownService.turndown(htmlContent);
        break;
    }
    
    const parseTime = Date.now() - parseStartTime;
    this.debugLog(`HTML parsing completed in ${parseTime}ms`);

    // 获取页面元数据
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';

    const result = {
      url,
      title,
      description,
      keywords,
      format,
      content,
      contentLength: content.length,
      timestamp: new Date().toISOString(),
      requestTime: Date.now() - startTime,
    };

    // 缓存结果
    if (useCache) {
      this.setCache(cacheKey, result);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
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