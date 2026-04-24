FROM oven/bun:1 AS base
WORKDIR /app
COPY . .
RUN bun install

# -------- Backend --------
FROM base AS backend
WORKDIR /app/src/backend
CMD ["bun", "run", "index.ts"]

# -------- Frontend --------
FROM base AS frontend
WORKDIR /app/src/frontend
RUN bun install
RUN bun run build
CMD ["bun", "run", "preview"]