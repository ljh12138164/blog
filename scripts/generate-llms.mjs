import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SITE_URL = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'site.config.json'), 'utf-8'),
).url;
const SITE_NAME = 'ljh的技术博客';
const SITE_DESC = '专注分享前端架构设计、多人实时协同（CRDT/OT）、现代 Web 性能调优、全栈边缘计算与 AI 大模型（LLM/Agent）工程化落地实践的技术博客。';

const postsDir = path.join(rootDir, 'app', 'posts');

function parseMetadata(content) {
  const metaMatch = content.match(/export\s+const\s+metadata\s*=\s*(\{[\s\S]*?\n\})/);
  if (!metaMatch) return {};

  const metaStr = metaMatch[1];
  const titleMatch = metaStr.match(/title:\s*['"]([^'"]+)['"]/);
  const descMatch = metaStr.match(/description:\s*['"]([^'"]+)['"]/);
  const dateMatch = metaStr.match(/date:\s*['"]([^'"]+)['"]/);
  const catMatch = metaStr.match(/category:\s*['"]([^'"]+)['"]/);
  const readingTimeMatch = metaStr.match(/readingTime:\s*['"]([^'"]+)['"]/);

  return {
    title: titleMatch ? titleMatch[1] : '',
    description: descMatch ? descMatch[1] : '',
    date: dateMatch ? dateMatch[1] : '',
    category: catMatch ? catMatch[1] : '其他',
    readingTime: readingTimeMatch ? readingTimeMatch[1] : '',
  };
}

function cleanMarkdownBody(content) {
  // 移除开头的 metadata 导出块
  return content.replace(/export\s+const\s+metadata\s*=\s*\{[\s\S]*?\n\}\s*/, '').trim();
}

export function generateLlms() {
  console.log('🤖 正在自动生成 llms.txt 和 llms-full.txt...');

  if (!fs.existsSync(postsDir)) {
    console.warn('⚠️ 未找到 app/posts 目录，跳过生成。');
    return;
  }

  const entries = fs.readdirSync(postsDir, { withFileTypes: true });
  const posts = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const mdxPath = path.join(postsDir, entry.name, 'page.mdx');
    if (!fs.existsSync(mdxPath)) continue;

    const rawContent = fs.readFileSync(mdxPath, 'utf-8');
    const meta = parseMetadata(rawContent);
    const body = cleanMarkdownBody(rawContent);

    if (meta.title) {
      posts.push({
        slug: entry.name,
        url: `${SITE_URL}/posts/${entry.name}`,
        ...meta,
        body,
      });
    }
  }

  // 按日期倒序排列
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // 按分类分组
  const groups = {};
  for (const post of posts) {
    const cat = post.category || '综合';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(post);
  }

  // 1. 构建 llms.txt 内容
  let llmsTxt = `# ${SITE_NAME}\n\n`;
  llmsTxt += `> ${SITE_DESC}\n\n`;
  llmsTxt += `本站是一个面向现代软件工程、前端架构与 AI 应用落地的技术知识库。所有内容均提供结构化全文，供 AI 检索、总结与权威引用。\n\n`;
  llmsTxt += `## 全站技术专题与文章索引\n\n`;

  for (const [category, catPosts] of Object.entries(groups)) {
    llmsTxt += `### ${category}\n\n`;
    for (const post of catPosts) {
      llmsTxt += `- [${post.title}](${post.url}): ${post.description} (发布日期: ${post.date})\n`;
    }
    llmsTxt += `\n`;
  }

  llmsTxt += `## 附加资源与全量数据\n\n`;
  llmsTxt += `- [全站完整文章纯文本合集 (llms-full.txt)](${SITE_URL}/llms-full.txt): 包含全站所有 ${posts.length} 篇技术博文的完整 Markdown 原文，专为大模型上下文（Context Window）批量处理设计。\n`;
  llmsTxt += `- [全站 XML 站点地图 (sitemap.xml)](${SITE_URL}/sitemap.xml): 搜索引擎爬虫索引入口。\n`;

  // 2. 构建 llms-full.txt 内容
  let llmsFullTxt = `# ${SITE_NAME} - 全站技术文章全量合集\n\n`;
  llmsFullTxt += `> 站点 URL: ${SITE_URL}\n`;
  llmsFullTxt += `> 总文章数: ${posts.length} 篇\n`;
  llmsFullTxt += `> 站点简介: ${SITE_DESC}\n\n`;
  llmsFullTxt += `================================================================================\n\n`;

  for (const post of posts) {
    llmsFullTxt += `# ${post.title}\n\n`;
    llmsFullTxt += `- **URL**: ${post.url}\n`;
    llmsFullTxt += `- **分类**: ${post.category}\n`;
    llmsFullTxt += `- **发布日期**: ${post.date}\n`;
    llmsFullTxt += `- **核心导读**: ${post.description}\n\n`;
    llmsFullTxt += `## 正文内容\n\n`;
    llmsFullTxt += `${post.body}\n\n`;
    llmsFullTxt += `--------------------------------------------------------------------------------\n\n`;
  }

  // 输出到 public 目录 (供开发环境访问) 与 out 目录 (供静态打包导出)
  const publicDir = path.join(rootDir, 'public');
  const outDir = path.join(rootDir, 'out');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxt, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullTxt, 'utf-8');

  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, 'llms.txt'), llmsTxt, 'utf-8');
    fs.writeFileSync(path.join(outDir, 'llms-full.txt'), llmsFullTxt, 'utf-8');
  }

  console.log(`✅ 成功生成 llms.txt 与 llms-full.txt（共索引 ${posts.length} 篇优质博文）！`);
}

generateLlms();
