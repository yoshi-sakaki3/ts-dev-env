# Node.js（開発用）。パッケージ管理は pnpm（corepack で有効化）
ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-bookworm-slim

ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    TZ=Asia/Tokyo
RUN corepack enable \
 && corepack prepare pnpm@latest --activate \
 && pnpm config set store-dir /pnpm/store

WORKDIR /app
