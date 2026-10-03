# 商业化体验与读者互动（AdSense & Giscus）roadmap

## Context

在完成主域名及 www 统一 301 重定向至 `blog.ljhboard.cn` 并提交 Google AdSense 审核后，针对博客的长期商业化质量、读者阅读体验与读者粘性，设立本路线图。

本路线图旨在：
1. 规避全自动广告破坏排版，实现优雅、防抖动的原生广告位布局；
2. 构建主题集群（Topic Clusters）以提升 SEO 权威度，并以零成本、保护源码私密的方式引入 Giscus 互动体系。

---

## Next（P1：近 1~2 周内执行）

### 手动设计文章底部/侧边原生广告位，关闭粗暴自动广告

- **Value**:
  - 保护文章排版与技术读者的沉浸式体验，避免 Google 全自动广告（Auto Ads）穿插切断代码块、Mermaid 流程图或重要文字。
  - 为广告插槽预先设立固定容器尺寸（`min-height`），防止广告异步加载导致页面大幅跳动（彻底解决 CLS 累积布局偏移，保持 Core Web Vitals 全绿）。
  - 在高转化、低反感的区域（正文末尾推荐区、桌面端目录下方吸顶区）实现健康的商业变现。

- **Dependencies**:
  - Google AdSense 审核通过，并在控制台生成手动展示广告单元（Display Ad Unit）。
  - 确认 `https://ljhboard.cn/ads.txt` 与 `https://blog.ljhboard.cn/ads.txt` 均可正常访问且被 Google 校验通过。

- **Implementation Scope**:
  1. **后台设置**: 在 Google AdSense 控制台中，关闭针对当前站点的“网页内全自动广告（In-page auto ads）”，仅保留手动广告单元控制权。
  2. **组件封装**:
     - 新建 `app/_components/ad-slot.tsx` 原生广告组件；
     - 支持固定高度占位容器与骨架状态，区分移动端与桌面端规格；
     - 优雅适配明暗（light / dark）主题底色。
  3. **布局插入**:
     - **槽位 1（文末位）**: 置于 `app/posts/[slug]/page.mdx` 正文结束之后、版权与免责说明之前；
     - **槽位 2（侧栏吸顶位）**: 置于桌面端侧边目录（TOC）下方，随滚动吸顶展示。

- **Completion signal**:
  - 广告仅在文末与侧边栏规范展示，正文中途无任何突兀插入；
  - 页面初次加载及广告渲染完成前后，页面无布局抖动（CLS < 0.05）。

---

## Later（P2：近 1 个月内执行）

### 梳理 2~3 个核心专栏系列（Topic Clusters）

状态：已完成（本次分类与阅读体验改进）。实现与验证见[文章发现与阅读体验](../development/blog-reading-discovery.md)。

- **Value**:
  - 将现有近 40 篇深度技术文章按照主题脉络进行体系化整理（构建 Topic Clusters），强化 Google 算法对全域的 Topical Authority（主题权威度）评估。
  - 引导读者深度连贯阅读，提升站内停留时长并降低跳出率。

- **Implementation Scope**:
  1. **规划 3 大核心专栏**:
     - 《从零构建多人实时协同架构》（CRDT、OT、Tiptap、协同笔记等相关博文）
     - 《现代 Web 性能与边缘计算工程》（Cloudflare、Anycast 缓存、Early Hints、打包调优等博文）
     - 《大模型与 AI Agent 全栈落地手记》（Gemini、DeepSeek 本地部署、Prompting、Token 机制等博文）
  2. **系统支撑**:
     - 在 `lib/post-discovery.ts` 集中维护系列与有序文章 slug，从已有 MDX 自动读取标题等元数据；
     - 在文章详情页尾部渲染所属系列、上一篇/下一篇及相关推荐；
     - 在 `/series` 与 `/series/<slug>` 提供专栏入口与阅读清单，文章索引、导航及页脚可进入。

- **Completion signal**:
  - 读者进入某篇系列文章时，可清楚了解当前系列进度并快速跳转上下篇；
  - 站内文章形成内链网状结构。

---

### 接入 Giscus 评论区（保持源码私密方案）

- **Value**:
  - 为博客注入技术交流与反馈生态，读者可基于 GitHub 账号发表高质量见解，直接发表 Markdown 代码块、图片与表情反应（Reaction）。
  - 采用“专用公开评论仓库”模式，在保留博客核心源代码完全私密（Private）的前提下，实现零服务器、零数据库、完全免费的互动体系。

- **Dependencies**:
  - 个人 GitHub 账号下新建独立的空公开仓库（例如 `ljh12138164/blog-comments`），并开启 Discussions 讨论区。
  - 在 [giscus.app](https://giscus.app/zh-CN) 生成配置参数（Repo ID、Category ID）。

- **Implementation Scope**:
  1. **依赖引入**: 安装 `@giscus/react`；
  2. **组件实现**:
     - 新建 `app/_components/comments.tsx` 客户端组件；
     - 对接博客明暗主题切换机制，确保深色/浅色模式切换时，Giscus 主题即时响应；
     - 配置 mapping 为 `pathname`（以文章 URL 作为讨论帖唯一标识）；
  3. **布局接入**: 置于文章页正文及广告位下方。

- **Completion signal**:
  - 读者可在文章底部登录 GitHub 并留言，讨论贴自动写入 `blog-comments` 仓库；
  - 博客明暗模式切换时，评论区样式同步更新；
  - 博客源代码仓库继续保持 100% 私密。
