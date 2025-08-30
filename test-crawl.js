import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

// 简单测试抓取功能
async function testCrawl() {
  console.log('测试网页抓取功能...');
  
  try {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    // 测试抓取一个简单的HTML页面
    const response = await axios.get('https://httpbin.org/html', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CrawlPageMCP/1.0)',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    // 提取标题和内容
    const title = $('title').text().trim();
    const bodyContent = $('body').html() || '';
    const markdown = turndownService.turndown(bodyContent);
    
    console.log('✅ 抓取成功!');
    console.log('标题:', title);
    console.log('Markdown内容长度:', markdown.length);
    console.log('前200个字符:', markdown.substring(0, 200) + '...');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testCrawl();