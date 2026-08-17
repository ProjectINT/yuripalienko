# syntax=docker/dockerfile:1

# Next.js 16 в режиме output: "standalone" под Dockhost.
# Три стадии: deps (зависимости) → builder (сборка) → runner (рантайм).

ARG NODE_IMAGE=node:24-alpine

# ---------- deps: только зависимости, слой кэшируется по локфайлу ----------
FROM ${NODE_IMAGE} AS deps

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- builder: next build ----------
FROM ${NODE_IMAGE} AS builder

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Обе переменные впекаются в HTML на сборке (SSG), поэтому нужны как ARG,
# а не как переменные окружения контейнера: смена значения требует пересборки.
ARG NEXT_PUBLIC_SITE_URL=https://palisoft.ru
ARG ALLOW_INDEXING=true
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV ALLOW_INDEXING=$ALLOW_INDEXING

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

# ---------- runner: минимальный образ ----------
FROM ${NODE_IMAGE} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone не тащит public и .next/static — их копируем руками.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# lib/og.tsx читает шрифты с диска относительно cwd на рендере OG-картинок.
COPY --from=builder --chown=node:node /app/assets/fonts ./assets/fonts
# lib/posts.ts читает content/posts/ так же с диска: OG-роут статьи динамический
# и берёт заголовок из JSON поста уже в рантайме.
COPY --from=builder --chown=node:node /app/content ./content

USER node
EXPOSE 3000

CMD ["node", "server.js"]
