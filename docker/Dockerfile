# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm via npm (more reliable than corepack)
RUN npm install -g pnpm@9.15.0

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/
COPY packages/mcp-server/package.json ./packages/mcp-server/
COPY packages/a2a-agent/package.json ./packages/a2a-agent/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build packages
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 agent-tools

# Copy standalone build (includes all dependencies)
COPY --from=builder --chown=agent-tools:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=agent-tools:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=agent-tools:nodejs /app/apps/web/public ./apps/web/public

# Create data directory for runtime settings
RUN mkdir -p /app/data && chown agent-tools:nodejs /app/data

USER agent-tools

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use node directly - no pnpm needed at runtime with standalone mode
CMD ["node", "apps/web/server.js"]
