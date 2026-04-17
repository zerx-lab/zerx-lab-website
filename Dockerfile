# =============================================================================
# ZerxLab Website - Dockerfile (多阶段构建 / Node standalone SSR)
# -----------------------------------------------------------------------------
# 构建策略:
#   1. deps   阶段:仅安装依赖(利用 Docker 层缓存,package.json 不变则不重装)
#   2. build  阶段:在装好依赖的基础上执行 `astro build`,产出 ./dist
#   3. runner 阶段:精简运行时镜像,只拷 dist/ + production 依赖
#
# 为什么分三阶段:
#   - 单阶段构建的镜像会把 devDependencies、源码、缓存等全打进最终镜像,
#     体积翻几倍。分层后最终镜像只含运行必须的文件。
#   - deps 和 build 分离让"改源码但没动依赖"的增量构建命中 deps 缓存,
#     构建速度提升明显。
#
# 运行时:
#   - 入口:node ./dist/server/entry.mjs(@astrojs/node standalone 产物)
#   - 监听:0.0.0.0:4321(HOST/PORT 均可通过环境变量覆盖)
#   - 需要的环境变量由 docker-compose.yml 或部署平台注入,不在镜像内硬编码:
#       DIRECTUS_URL          Directus 实例地址
#       DIRECTUS_READ_TOKEN   读权限静态 token(运行时从 Directus 拉数据用)
#       SITE_URL              站点自身 canonical 域名(用于 RSS / sitemap 绝对 URL)
#
# 基础镜像选择:
#   - node:22-alpine:Node 22 LTS,体积 ~50MB,与 package.json engines.node 对齐
#   - Alpine 缺 glibc 会影响某些 native 模块,但本项目无原生模块,无风险
#
# Bun vs npm:
#   - 本地开发用 bun,但 Docker 内用 npm ci,原因:
#     1. Alpine 上 bun 官方镜像体积更大,且 lockfile 兼容性需要额外配置
#     2. npm 有确定性安装(ci + package-lock.json),CI 环境更稳定
#   - 若未来希望镜像内也用 bun,切换到 oven/bun:1-alpine 基础镜像即可
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: deps — 安装全部依赖(含 devDependencies,build 阶段需要)
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps

WORKDIR /app

# 只拷依赖清单,最大化 Docker 层缓存:源码变动不会使本层失效
COPY package.json package-lock.json* bun.lockb* bun.lock* ./

# 优先使用 npm ci(依赖 package-lock.json);若仓库用 bun lockfile 且没有
# package-lock.json,退化为 npm install(非确定性,但能跑通)。
# 生产镜像不需要 bun runtime,用 npm 已经够用。
RUN if [ -f package-lock.json ]; then \
      npm ci --include=dev; \
    else \
      npm install --include=dev; \
    fi


# -----------------------------------------------------------------------------
# Stage 2: build — 执行 astro build,产出 ./dist
# -----------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# 拷依赖产物(node_modules)+ 全量源码
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建期不需要真正访问 Directus:
#   - astro build 在 output: "server" 下只编译代码,不再抓取 CMS 数据
#   - 数据拉取完全放在运行时(SSR 每个请求)
#   - 因此这里不注入 DIRECTUS_* 环境变量,避免把 token 泄露到镜像层
#
# 若未来加入 SSG 预渲染页面(prerender = true),且该页面需要从 Directus 读数据,
# 再通过 --build-arg 注入 readonly 构建时 token。
ENV NODE_ENV=production

RUN npm run build


# -----------------------------------------------------------------------------
# Stage 3: runner — 精简运行时镜像
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# 创建非 root 用户运行进程(安全最佳实践:容器逃逸影响面最小化)
# node:22-alpine 自带 uid=1000 的 node 用户,直接复用
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4321

# 只拷运行必须的文件:
#   1. dist/              — astro build 产物(含 server/entry.mjs 与 client 资源)
#   2. package.json       — npm 解析依赖清单用
#   3. 生产依赖 node_modules(剔除 devDependencies)
#
# 生产依赖单独安装而不是从 deps 阶段拷:
#   deps 阶段装了 dev 依赖(astro、typescript 等),体积大;
#   runner 阶段只装运行必须的包,镜像更小。
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json* ./

RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev && npm cache clean --force; \
    else \
      npm install --omit=dev && npm cache clean --force; \
    fi

# 切到非 root 用户
USER node

# Astro standalone 默认监听 4321,可被 PORT 覆盖
EXPOSE 4321

# 健康检查:命中首页返回 200 即视为健康
# 宽松的 start-period 给 Node 进程冷启动留时间(Astro 首次渲染会加载较多模块)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --quiet --spider --tries=1 http://127.0.0.1:${PORT:-4321}/ || exit 1

# 入口:直接跑 Astro node standalone 产物,不经 npm run,
# 少一层 shell 进程,信号传递更直接(SIGTERM 能被 Node 正确捕获做 graceful shutdown)
CMD ["node", "./dist/server/entry.mjs"]
