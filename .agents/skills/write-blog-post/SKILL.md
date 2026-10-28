---
name: write-blog-post
description: Write, draft, or polish technical MDX blog posts for this Nextra personal blog with an authentic, human engineering voice. Use when creating new blog posts, drafting article content, rewriting or humanizing existing posts to remove AI writing tropes, or reviewing article prose style.
---

# Write Blog Post

编写与优化具备一线工程师真实语感的技术博文，去除 AI 八股文与营销套话。

## Quick Start: MDX 文章骨架

每个新博文均应保存至 `app/posts/<slug>/page.mdx`：

```mdx
export const metadata = {
  title: '清晰描述核心方案与解决的问题',
  description: '客观陈述文章包含的具体实践、架构约束与关键度量，不使用空洞修辞。',
  date: 'YYYY-MM-DD',
  category: '技术分类',
  readingTime: 'X 分钟',
  alternates: { canonical: '/posts/<slug>' },
  openGraph: { type: 'article', title: '...', description: '...', url: '/posts/<slug>', images: ['/og-image.png'] },
  twitter: { card: 'summary_large_image', title: '...', description: '...', images: ['/og-image.png'] },
}

## 读完你能做什么

- 动作导向的收获 1（做什么，解决什么问题）。
- 动作导向的收获 2。
- 动作导向的收获 3。

```mermaid
flowchart LR
  A[输入/起点] --> B[核心流程] --> C[最终产物/结果]
```

核心原则：一句话点出最根本的技术权衡或系统约束。

开门见山陈述业务场景、技术背景与遇到的真实痛点，直接切入正题。

---

## 核心实现与方案推导

正文从 H2 组织，包含具体代码、配置与关键因果分析...

---

## 工程经验小结

记录真实的架构权衡（Trade-offs）、踩坑防线或适用边界，坚决不写口号式假大空总结。
```

## Workflows

### 撰写新文章

1. **立意与场景**：明确文章解决的工程问题与实际落地场景，杜绝无场景的技术空谈。
2. **构建标准骨架**：遵循上方 Quick Start 模板，正文统一从 H2 开始（H1 由 metadata 提供）。
3. **注入工程师语调**：使用自然口吻陈述因果，用真实数据替代模糊评价，多写踩坑防线与取舍。
4. **验证与同步**：文章写完后同步至 `apps/blog/lib/posts.ts`，并从根目录执行构建校验；博客应用内的文件路径以 `apps/blog` 为基准。

### 优化或改写既有文章（去 AI 痕迹）

1. **扫描模式**：检查标题、描述、导言是否包含虚假区间（“从 X 到 Y”）或三段式垫话。
2. **清洗大词与排比**：剔除“极致丝滑”、“彻底杜绝”、“降维打击”等宣传大词；打破生硬的加粗列表。
3. **重写结语**：将机械的“总结：1. 坚决... 2. 榨干...”改为“工程经验小结”，重点记录架构权衡。
4. **守住代码边界**：代码段、类型定义、Mermaid 图表与外部链接必须 100% 完整保留。

## 深入参考

- 完整反 AI 模式指南与禁用词汇表：[REFERENCE.md](REFERENCE.md)
- 真实技术博文改写对照样例：[EXAMPLES.md](EXAMPLES.md)

## Review Checklist

- [ ] `metadata.title` 与 `description` 无“从 X 到 Y”、“全面解析”等套话
- [ ] 导言直接切入工程痛点，无行业宏大叙事与三段式铺垫
- [ ] 无浮夸营销词汇，评价均有客观度量或场景限定
- [ ] 结尾为具备启发性的“工程经验小结”，体现真实技术权衡
- [ ] 代码、Mermaid 图、Schema 与路由链接完整准确
