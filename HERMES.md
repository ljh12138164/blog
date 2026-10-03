# Hermes

## 状态：已完成待交付

目标：使用 Workbox 构建脚本集成 Service Worker，实现页面 NetworkFirst、哈希静态资源 CacheFirst、第三方动态请求 NetworkOnly 的缓存策略。

分支：`feat/service-worker-caching`，基线 `d5e9f61`。

开发文档：`docs/development/service-worker-caching.md`。

验证：typecheck、Biome、24 项单元测试（含 SW 策略测试）、生产构建与 postbuild 流水线通过；`out/sw.js` 包含内联 Workbox 运行时，`out/index.html` 包含注册逻辑，`sw.js.gz` 预压缩生成完毕。无阻塞。

PR：待推送与创建

## 下一步：向用户汇报实现方案与测试结果，确认后提交并推送到远端创建 PR。
