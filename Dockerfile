FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/blog/package.json apps/blog/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @blog/web build

FROM nginx:1.30.6-alpine AS runtime

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/blog/.next/early-hints-map.conf /etc/nginx/conf.d/early-hints-map.conf
COPY --from=builder /app/apps/blog/out /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
