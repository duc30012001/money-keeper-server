# ── Stage 1: Builder ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# 1) Install all deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 2) Copy everything (including src, keys, etc.) and build
COPY . .
RUN yarn build

# ── Stage 2: Production ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# 3) Install only prod deps
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

# 4) Bring in the compiled code
COPY --from=builder /app/dist ./dist

# 5) **Bring in your keys folder** so /app/keys exists at runtime
COPY --from=builder /app/keys ./keys

# 6) Start your app
EXPOSE 3000
CMD ["yarn", "start:prod"]
