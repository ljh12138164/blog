# 使用直接静态 release 部署

状态：已采纳。

博客是静态导出站点，GitHub Actions 负责构建和验证，随后将压缩产物写入受限 SSH 部署命令的标准输入。服务器仅将它解压到按 commit 命名的 release 目录，并原子切换 `current` 软链接；宝塔 Nginx 直接从该链接提供文件。此举移除 GHCR、Docker 和服务器 Node.js 构建负担，适合 2 GB 内存服务器，同时保留不可变版本和回滚能力。
