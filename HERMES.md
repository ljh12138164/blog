# Hermes

## 当前目标

为博客建立可重复的静态容器发布：GitHub Actions 构建 SSG、Pagefind、sitemap 和 GHCR 镜像，通过受限 SSH 命令部署到阿里云 ECS，并在失败时自动回滚。

## 状态

进行中：仓库与服务器基础配置已完成，等待写入 GitHub Actions Secret/Variables、触发首次发布并接入宝塔 Nginx。

## 已完成

- 确认公开地址暂为 `http://60.205.171.159`，以后由 GitHub Variable 替换。
- 确认宝塔 Nginx 作为统一入口，博客运行在独立静态 Nginx 容器。
- 确认 GHCR 镜像公开，服务器目录为 `/opt/stacks/blog`。
- 确认部署使用受限 SSH 强制命令，健康检查失败自动回滚。
- Workbench 已连接实例 `i-2ze77shgsxr3nwn6ghra`（`cn-beijing`）。
- 已添加静态导出、Docker/Nginx、Compose、受限部署脚本和 GitHub Actions。
- 已创建 `maintain-blog` Skill、部署文档、术语表和两项部署 ADR。
- `pnpm typecheck`、静态构建、Pagefind、sitemap、Compose 和 Skill 校验已通过。
- ECS 已创建 `blog-deploy` 受限用户，并安装强制命令、sudo 白名单和 `/opt/stacks/blog/compose.yaml`。

## 下一步

1. 配置 GitHub Actions Secret/Variables，提交并推送仓库变更。
2. 等待镜像发布，将 GHCR 包设为公开并执行首次部署。
3. 容器健康后启用宝塔 Nginx 反向代理并验证公网访问。

## 验证

- 已通过：`pnpm typecheck`。
- 已通过：`pnpm build` 生成完整 `out/`、Pagefind 索引和 sitemap。
- 已通过：`docker compose config`。
- 已通过：项目 Skill 官方校验器。
- 待验证：Docker 镜像健康检查。
- 待验证：公网 `/healthz` 与文章页面。

## 阻塞

无。
