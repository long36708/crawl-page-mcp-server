#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, '../dist/index.js');
const content = fs.readFileSync(filePath, 'utf8');

// 如果已经有shebang，先移除
const cleanContent = content.replace(/^#!.*\n?/, '');

// 添加正确的shebang
const finalContent = `#!/usr/bin/env node\n${cleanContent}`;

fs.writeFileSync(filePath, finalContent);
console.log('Shebang added successfully!');
