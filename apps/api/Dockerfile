FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/blog/package.json apps/blog/package.json
RUN pnpm install --frozen-lockfile --filter @blog/api... --ignore-scripts
COPY apps/api apps/api
RUN pnpm --filter @blog/api build
RUN pnpm --filter @blog/api deploy --prod /runtime

FROM oven/bun:1.4.4-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
COPY --from=builder --chown=bun:bun /runtime/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/apps/api/dist ./dist
COPY --from=builder --chown=bun:bun /app/apps/api/drizzle ./drizzle
USER bun
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD bun -e "const r = await fetch('http://127.0.0.1:3001/api/readyz'); process.exit(r.ok ? 0 : 1)"
CMD ["bun", "dist/main.js"]
