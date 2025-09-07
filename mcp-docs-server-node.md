# MCP 天气服务器开发教程

基于 https://mcp-docs.cn/quickstart/server#node 页面内容整理

## 概述

在本教程中，我们将构建一个简单的 MCP 天气服务器，并将其连接到一个 host，即 Claude for Desktop。我们将从基本设置开始，然后逐步介绍更复杂的用例。

## 我们将构建什么

许多 LLM 目前不具备获取天气预报和恶劣天气警报的能力。让我们使用 MCP 来解决这个问题！

我们将构建一个服务器，它暴露两个 tools：

- `get-alerts` - 获取天气警报
- `get-forecast` - 获取天气预报

然后，我们将服务器连接到一个 MCP host（在本例中是 Claude for Desktop）。

> **为什么选择 Claude for Desktop 而不是 Claude.ai？** 因为服务器是本地运行的，所以 MCP 目前仅支持 desktop hosts。远程 hosts 正在积极开发中。

## 核心 MCP 概念

MCP 服务器可以提供三种主要类型的能力：

- **Resources**: 可以被 clients 读取的类文件数据（如 API 响应或文件内容）
- **Tools**: 可以被 LLM 调用的函数（需要用户批准）
- **Prompts**: 预先编写的模板，帮助用户完成特定任务

本教程将主要关注 tools。

## 前提知识

本快速入门假设你熟悉：

- TypeScript
- LLMs，如 Claude

## 系统要求

对于 TypeScript，请确保你已安装最新版本的 Node。

## 设置你的环境

首先，如果你还没有安装 Node.js 和 npm，请安装它们。你可以从 [nodejs.org](https://nodejs.org) 下载它们。

验证你的 Node.js 安装：

```bash
node --version
npm --version
```

在本教程中，你需要 Node.js 16 或更高版本。

现在，让我们创建并设置我们的项目：

```bash
mkdir weather-server
cd weather-server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install --save-dev typescript @types/node
```

### 配置 package.json

更新你的 `package.json` 以添加 `type: "module"` 和一个 build script：

```json
{
  "type": "module",
  "bin": {
    "weather": "./build/index.js"
  },
  "scripts": {
    "build": "tsc && chmod 755 build/index.js"
  },
  "files": ["build"]
}
```

### 配置 TypeScript

在你的项目的根目录下创建一个 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## 构建你的服务器

### 导入 packages 并设置 instance

将这些添加到你的 `src/index.ts` 文件的顶部：

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const NWS_API_BASE = 'https://api.weather.gov';
const USER_AGENT = 'weather-app/1.0';

// 创建 server instance
const server = new McpServer({
  name: 'weather',
  version: '1.0.0',
  capabilities: {
    resources: {},
    tools: {},
  },
});
```

### Helper functions

接下来，让我们添加 helper functions，用于查询和格式化来自 National Weather Service API 的数据：

```typescript
// Helper function 用于发送 NWS API 请求
async function makeNWSRequest<T>(url: string): Promise<T | null> {
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/geo+json',
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error('Error making NWS request:', error);
    return null;
  }
}

interface AlertFeature {
  properties: {
    event?: string;
    areaDesc?: string;
    severity?: string;
    status?: string;
    headline?: string;
  };
}

// 格式化警报数据
function formatAlert(feature: AlertFeature): string {
  const props = feature.properties;
  return [
    `Event: ${props.event || 'Unknown'}`,
    `Area: ${props.areaDesc || 'Unknown'}`,
    `Severity: ${props.severity || 'Unknown'}`,
    `Status: ${props.status || 'Unknown'}`,
    `Headline: ${props.headline || 'No headline'}`,
    '---',
  ].join('\n');
}

interface ForecastPeriod {
  name?: string;
  temperature?: number;
  temperatureUnit?: string;
  windSpeed?: string;
  windDirection?: string;
  shortForecast?: string;
}

interface AlertsResponse {
  features: AlertFeature[];
}

interface PointsResponse {
  properties: {
    forecast?: string;
  };
}

interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}
```

### 实现 tool execution

Tool execution handler 负责实际执行每个 tool 的逻辑。让我们添加它：

```typescript
// 注册天气 tools
server.tool(
  'get-alerts',
  '获取某个州的天气警报',
  {
    state: z.string().length(2).describe('两个字母的州代码（例如 CA、NY）'),
  },
  async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

    if (!alertsData) {
      return {
        content: [
          {
            type: 'text',
            text: '未能检索警报数据',
          },
        ],
      };
    }

    const features = alertsData.features || [];
    if (features.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No active alerts for ${stateCode}`,
          },
        ],
      };
    }

    const formattedAlerts = features.map(formatAlert);
    const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join('\n')}`;

    return {
      content: [
        {
          type: 'text',
          text: alertsText,
        },
      ],
    };
  },
);

server.tool(
  'get-forecast',
  '获取某个位置的天气预报',
  {
    latitude: z.number().min(-90).max(90).describe('位置的纬度'),
    longitude: z.number().min(-180).max(180).describe('位置的经度'),
  },
  async ({ latitude, longitude }) => {
    // 获取网格点数据
    const pointsUrl = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const pointsData = await makeNWSRequest<PointsResponse>(pointsUrl);

    if (!pointsData) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
          },
        ],
      };
    }

    const forecastUrl = pointsData.properties?.forecast;
    if (!forecastUrl) {
      return {
        content: [
          {
            type: 'text',
            text: 'Failed to get forecast URL from grid point data',
          },
        ],
      };
    }

    // 获取预报数据
    const forecastData = await makeNWSRequest<ForecastResponse>(forecastUrl);
    if (!forecastData) {
      return {
        content: [
          {
            type: 'text',
            text: 'Failed to retrieve forecast data',
          },
        ],
      };
    }

    const periods = forecastData.properties?.periods || [];
    if (periods.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No forecast periods available',
          },
        ],
      };
    }

    // 格式化预报 periods
    const formattedForecast = periods.map((period: ForecastPeriod) =>
      [
        `${period.name || 'Unknown'}:`,
        `Temperature: ${period.temperature || 'Unknown'}°${period.temperatureUnit || 'F'}`,
        `Wind: ${period.windSpeed || 'Unknown'} ${period.windDirection || ''}`,
        `${period.shortForecast || 'No forecast available'}`,
        '---',
      ].join('\n'),
    );

    const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join('\n')}`;

    return {
      content: [
        {
          type: 'text',
          text: forecastText,
        },
      ],
    };
  },
);
```

### 运行 server

最后，实现 main function 以运行 server：

```typescript
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Weather MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
```

确保运行 `npm run build` 以 build 你的 server！这是让你的 server 连接起来非常重要的一步。

## 使用 Claude for Desktop 测试你的 server

首先，确保你已安装 Claude for Desktop。你可以在[这里](https://claude.ai/download)安装最新版本。

如果你已经安装了 Claude for Desktop，请确保它已更新到最新版本。

### 配置 Claude for Desktop

我们需要为你想要使用的任何 MCP servers 配置 Claude for Desktop。为此，请在文本编辑器中打开 `~/Library/Application Support/Claude/claude_desktop_config.json` 中的 Claude for Desktop App configuration。

如果该 file 不存在，请确保创建它。例如，如果你安装了 VS Code：

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

然后，你将在 `mcpServers` key 中添加你的 servers。只有正确配置了至少一个 server，MCP UI 元素才会显示在 Claude for Desktop 中。

在本例中，我们将添加我们的单个天气服务器，如下所示：

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/PARENT/FOLDER/weather/build/index.js"]
    }
  }
}
```

这告诉 Claude for Desktop：

- 有一个名为 "weather" 的 MCP server
- 通过运行 `node /ABSOLUTE/PATH/TO/PARENT/FOLDER/weather/build/index.js` 来启动它

保存 file，并重新启动 Claude for Desktop。

### 使用 commands 测试

让我们确保 Claude for Desktop 正在接收我们在 weather server 中暴露的两个 tools。你可以通过查找锤子 icon 来做到这一点。

单击锤子 icon 后，你应该看到列出了两个 tools。

如果你的 server 未被 Claude for Desktop 接收，请继续阅读故障排除部分以获取 debug 提示。

如果锤子 icon 已经显示，你现在可以通过在 Claude for Desktop 中运行以下 commands 来测试你的 server：

- Sacramento 的天气怎么样？
- Texas 有哪些活跃的天气警报？

## 底层发生了什么

当你提出问题时：

1. client 将你的问题发送给 Claude
2. Claude 分析可用的 tools 并决定使用哪些 tool
3. client 通过 MCP server 执行选择的 tool
4. 结果被发回给 Claude
5. Claude 制定自然语言响应
6. 响应显示给你！

## 故障排除

如果遇到问题，请检查：

- Node.js 版本是否为 16 或更高
- 是否正确运行了 `npm run build`
- Claude Desktop 配置文件路径是否正确
- 服务器文件的绝对路径是否正确

## 后续步骤

- 添加更多天气相关的 tools
- 实现缓存机制
- 添加错误处理和重试逻辑
- 探索其他 MCP 功能如 Resources 和 Prompts

---

_本文档基于 https://mcp-docs.cn/quickstart/server#node 页面内容整理_
