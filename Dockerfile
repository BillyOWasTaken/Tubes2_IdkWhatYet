# Base Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Install deps
COPY package.json bun.lock ./
COPY src ./src
RUN bun install

# -------- Backend --------
FROM base AS backend
WORKDIR /app/src/backend
EXPOSE 3000
CMD ["bun", "run", "index.ts"]

# -------- Frontend --------
FROM base AS frontend
WORKDIR /app/src/frontend
RUN bun run build
EXPOSE 5173
CMD ["bun", "run", "preview"]