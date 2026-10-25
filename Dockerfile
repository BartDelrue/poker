# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.22

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
# Pin pnpm to the version in package.json ("packageManager")
RUN npm install -g pnpm@10.15.1

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
COPY --from=build /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
