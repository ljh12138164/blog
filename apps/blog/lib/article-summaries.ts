// 新增或修改文章时，依据正文同步维护摘要；不要用 SEO description 代替。
export const articleSummaries: Record<string, string> = {
  'agent-fundamentals':
    'Agent 把模型放进工具执行循环：模型提出动作，应用校验参数并执行，再把结果交回模型。文章用 AI SDK 串起工具、消息状态与 MCP，说明如何设置停止条件和预算，以及在高风险动作前加入审批。权限仍由代码掌握，完成说明不能代替执行记录。',
  'anchor-data-url':
    '图片或 PDF 的 Data URL 无法直接在新标签页打开，往往是浏览器阻止了顶级窗口导航。文章给出转换为 Blob URL 的预览与下载方案，并区分下载、图片展示和新标签页的释放时机。临时地址需要显式回收，过早释放也可能让预览加载失败。',
  'cloudflare-cdn-acceleration':
    'Cloudflare 缓存配置需要区分带哈希的静态资源、会变化的 HTML 和私有响应。文章结合 Cache Rules 与源站缓存头说明命中、过期和回源的判断方法，并用响应头排错。发布流程还要配合缓存清除，避免旧页面继续引用已不存在的资源。',
  'cloudflare-custom-hostname-fast-ip':
    '这次实践用一个注册域名串起 Cloudflare for SaaS、优选 IP 和宝塔定时任务，只更新统一的 DNS 入口。脚本在切换前后验证 HTTPS，失败时恢复旧值。启用前需处理支付方式；这条社区路径需要自行验证，单台服务器测速也不能代表全国线路。',
  'cloudflare-http3-early-hints':
    '静态博客由 Nginx 在最终响应中提供 Link，Cloudflare 再据此生成 103。文章实现按路由提取 CSS 的构建脚本、Nginx 映射与线上验收，确保提示和页面来自同一次构建。最终 200 中的 Link 是稳定合约，不能要求每次请求都出现 103。',
  'cloudflare-turnstile':
    'Turnstile 的接入包括前端获取 Token、业务请求携带凭证，以及服务端调用 Siteverify。业务动作必须在验证成功后执行。文章同时处理凭证过期、一次性使用与验证失败后的重置；验证码仍需配合后端限流，不能单独承担全部防刷责任。',
  'collaborative-note-optimization':
    '协同笔记的部署问题分为子路由刷新 404 与首屏包过大。文章用 SPA 重写解决路由回退，再通过构建分析定位 lodash、代码高亮语言包等依赖，配合按需引入和分包。最后补齐无障碍与 SEO 检查，以产物体积和实际加载表现核对改动效果。',
  'conflict-resolution-algorithm':
    '协同编辑需要让收到同一组更新的副本最终收敛。文章用并发插入例子比较 OT 的坐标转换与 CRDT 的合并思路，再解释 Yjs 的块合并、状态向量和垃圾回收。选型时需一起考虑中心服务、离线编辑、文档结构和元数据开销，而非只比较算法名称。',
  'custom-flowchart-connections':
    '自定义流程图连线先从节点坐标推导贝塞尔曲线，再接入 React Flow 的 Edge 渲染。文章把路径计算与拖拽交互分开，使用 EdgeLabelRenderer 承载标签和删除按钮。edgeTypes 应保持稳定，避免状态更新时反复重建连线组件。',
  'custom-form-designer':
    '表单设计器以稳定的字段协议连接物料、画布、属性面板和运行时渲染器。文章给出 Schema 与组件注册表的实现，并讨论显隐联动和异步选项。设计态的选中、拖拽状态不应混入表单值；协议还需版本化，保证已收集的数据能继续回显。',
  'custom-form-feasibility':
    'Zod 可以统一类型和校验规则，但无法仅凭数据类型判断字段该显示成什么控件。文章用 AutoForm 分析自动映射的收益与边界：标准后台表单适合推导，复杂布局、分步流程和强联动仍需显式配置。覆盖代码超过手写成本时，应重新考虑方案。',
  'custom-form-optimization':
    '动态表单的卡顿需要分别排查首屏下载与字段重渲染。文章把 ExcelJS 移到导出时加载，为真实网络依赖预连接，再用字段订阅和 Memo 缩小更新范围。优化前先记录资源体积、输入延迟与渲染次数，修改后通过构建报告和 Profiler 复测。',
  'deepseek-local-deployment':
    '本地运行 DeepSeek 前，需要一起估算模型权重、量化格式和上下文带来的显存占用。文章比较 Ollama 的命令行与 API 接入、LM Studio 的可视化调参，并介绍 WebUI 连接。先用小模型打通流程，再提高规模，同时核对实际加载位置与服务访问边界。',
  'edge-function-backend-deployment':
    '文章比较常驻容器、Serverless 与边缘运行时，并用 Hono 组织轻量 API。迁移前要核对依赖的系统 API、任务时长和数据库连接方式；短生命周期函数不宜照搬常驻服务的连接池。无状态代理与 Webhook 更适合边缘部署，重型本地依赖则需谨慎。',
  'for-of-vs-foreach':
    'forEach 会忽略异步回调返回的 Promise，批量上传因此可能提前提交结果，也无法用外层 try/catch 收集回调错误。文章分别用 for...of 实现串行等待、用 Promise.all 等待独立任务，并提醒大批量操作设置并发上限。',
  'gemini-api':
    'Gemini 请求通过服务端 Hono 代理发起，密钥留在服务端，浏览器只消费结果。文章分别展示流式文本、结构化 JSON 与前端流读取，并讨论输出契约、异常和取消请求。代理层还承担鉴权、限流与日志边界，不能只把它当成隐藏密钥的转发器。',
  'gemini-image-recognition':
    '文章用 Hono 与 Gemini 处理远程图片和本地上传，提取结构化识别结果。输入需要校验体积、MIME 类型和请求权限，大文件可改走 File API。输出即使受 Schema 约束，关键金额等字段仍需业务校验；图片缩放还要兼顾传输成本与文字可读性。',
  'git-commit-validation':
    '本地提交钩子用 Biome 检查暂存文件，再校验 Conventional Commits，让格式和基础错误尽早反馈。文章给出 lint-staged、simple-git-hooks 与提交信息规则的配置。本地钩子可以被跳过，关键检查仍需放在 CI 与分支保护中执行。',
  'jebet-project-management':
    '敏捷看板用 MobX 处理局部交互，React Query 管服务端缓存，Socket.io 传递实时事件。文章梳理任务拖拽、多租户和 RBAC 的边界，强调避免两份数据真相。广播需识别发送者以避免重复更新，授权必须由后端检查，隐藏按钮只改善交互。',
  'ljh-design-system':
    '设计系统把视觉令牌、基础组件与业务模板分层，让共享决策集中定义。文章用 CSS 变量支持主题切换，以 Radix 处理交互、CVA 管样式变体，并约束 AI 生成组件的契约。令牌不宜过碎，复杂焦点和键盘行为优先复用成熟原语。',
  'local-english-chinese-translation':
    '文章通过 MTranServer 在 Next.js 服务端翻译英文标题与纯文本正文，前端按钮切换译文和原文。模型实例由当前进程复用，也可提前下载语言模型。预下载只准备磁盘文件，首次推理仍需加载模型；示例接口直接接收文本，已有数据源可改传文章 ID。',
  'markdown-to-html':
    'Markdown 经 MDAST、HAST 再转为 HTML，remark 与 rehype 分别处理不同阶段。文章结合 Nextra、MDX 组件映射和 Pagefind 说明静态博客的编译链路。交互组件会增加构建负担；搜索索引必须等 HTML 完整生成后再构建，并关注不可信内容的安全边界。',
  'monorepo-management':
    'pnpm workspace 管包依赖与本地链接，Turborepo 管任务顺序和构建缓存。文章给出仓库结构、workspace 协议与任务配置，解释跨包联调方式。缓存需要明确输入、环境变量和产物目录，否则可能复用过期结果；仓库合并本身不保证效率提升。',
  'nextra-blog-setup':
    '这篇文章梳理 Next.js App Router 与 Nextra 静态博客的搭建流程，涵盖 MDX 组件映射、Pagefind、站点地图和 Docker 打包。静态导出不能使用请求时的服务端能力，相关逻辑需交给构建或部署层；开发页能打开，还不足以证明生产产物可用。',
  'note-collaboration-system':
    '协同笔记除了正文同步，还需要目录、在线状态和历史版本。文章用状态机描述首次加载、离线编辑与重连，再组合 IndexedDB 和 WebSocket Provider 保留本地修改。版本恢复通过快照与新事务组织，权限、持久化和失败恢复也需有各自边界。',
  'prompting-principles':
    '可靠提示词要写清任务、证据范围、边界行为与输出契约。文章以客服工单为例，把模糊要求改成可验收规则，再用正常、缺失信息和边界案例定义行为。修改后应运行同一组评测，而不是只挑一次好回答；角色设定和重复强调都不能替代具体任务。',
  'react-execution-order':
    '文章通过日志实验梳理 React 的 render、commit、布局副作用与普通副作用，比较挂载、更新和清理时机。渲染计算应保持纯净，DOM 测量需要考虑绘制时机。父子组件的数据依赖应通过状态提升或显式回调表达，避免把副作用执行顺序当成同步契约。',
  'react-query-api-optimization':
    '请求函数负责取得数据，TanStack Query 负责请求调度和服务端缓存。文章通过 Query Key 去重、staleTime 与 gcTime 区分缓存规则，再实现可回滚的乐观更新。先明确数据所有权与失效时机，才能避免重复请求、无谓刷新和失败后的状态不一致。',
  'redirect-status-codes-seo':
    '选择 301、302、307 或 308 时，需要同时考虑永久性与请求方法、请求体是否保留。文章结合域名迁移和 API 跳转展示 Next.js 与 Nginx 配置，并说明如何核对 Location、跳转链和 canonical。永久跳转可能被缓存，尚未确定的迁移可先用临时跳转验证。',
  'seo-geo-indexnow':
    'SEO 与 GEO 共享可抓取页面、清晰内容和可靠来源，IndexNow 则通知参与搜索引擎 URL 变化。文章把 canonical、结构化数据、sitemap 与发布流程串起来，再用站长工具观察实际结果。提交不保证收录，llms.txt 也不能当作 Google 排名信号。',
  'tiptap-collaboration':
    'Tiptap 负责编辑器，Yjs 合并文档更新，Hocuspocus 承担协同连接与服务端扩展。文章接入正文同步、在线光标和持久化，说明撤销重做应由协同扩展接管。Awareness 属于临时在线状态，不应存入正文；鉴权、重连和历史更新也要单独处理。',
  'token-and-context':
    'Token 数取决于模型编码，不能按字符数固定换算。文章用真实请求计数、上下文预算和稳定前缀解释输入、输出空间与缓存的关系。指令、历史、工具和资料都占用窗口，整理时应按相关性取舍，并用实际 usage 校准，而非只追求更短输入。',
  'tsup-bundler':
    'tsup 可以生成 ESM、CommonJS 与类型声明，但库发布还需正确配置 exports 和外部依赖。文章结合共享包实践说明入口、监听构建和消费端验证。React 等运行时应避免被重复打包；编译命令成功之后，还要检查目标项目能否加载代码与类型。',
  'type-safe-routing':
    '文章将 Hono 路由挂载到 Next.js，使用 Zod 校验请求，再通过 hc 把服务端类型带到客户端，并接入 TanStack Query。编译期推导减少重复声明，却不能代替运行时验证。网络失败、非成功响应和序列化错误仍需处理，过长路由链也要关注类型推导成本。',
  'umami-vercel-supabase':
    '文章用 Vercel 托管 Umami、Supabase 存访问数据，展示数据库连接、环境变量、后台初始化与统计域名的配置。迁移与运行时需要区分直连和连接池，首次登录应修改默认凭据。长期运行还需关注连接数、免费实例暂停和统计脚本被拦截的问题。',
  'websocket-edge-functions':
    '把协同服务部署到边缘前，要确认平台支持 WebSocket、所需运行时 API 与长连接。文章以 Deno 和 Hocuspocus 说明接入与部署。多区域实例的内存房间不会自动互通，同一文档需要中继或协调层；小规模场景可先用单区域降低状态管理成本。'
}
