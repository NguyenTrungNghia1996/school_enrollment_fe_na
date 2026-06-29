# FROM node:20-alpine AS nodebuilder

# WORKDIR /app
# COPY package.json .
# COPY yarn.lock .
# RUN yarn install
# COPY . .
# RUN yarn build

# FROM node:20-alpine AS bin

# # Build metadata (can be overridden by build args)
# ARG BUILD_TAG=dev
# ARG BUILD_SHA=dev
# ARG BUILD_TIME

# # Expose build metadata to the running container (Nuxt public runtime)
# ENV NUXT_PUBLIC_BUILD_TAG=$BUILD_TAG \
#     NUXT_PUBLIC_BUILD_SHA=$BUILD_SHA \
#     NUXT_PUBLIC_BUILD_TIME=$BUILD_TIME

# COPY --from=nodebuilder /app/.output ./.output
# CMD ["node", ".output/server/index.mjs"]

FROM node:20-alpine AS nodebuilder

WORKDIR /app

# 1. Copy dependency first (giữ cache layer)
COPY package.json yarn.lock ./

# 2. Fix network + tăng ổn định yarn
RUN yarn config set registry https://registry.npmmirror.com \
    && yarn install --frozen-lockfile --network-timeout 1000000

# 3. Copy source code
COPY . .

# 4. Build
RUN yarn build


FROM node:20-alpine AS bin

WORKDIR /app

ARG BUILD_TAG=dev
ARG BUILD_SHA=dev
ARG BUILD_TIME

ENV NUXT_PUBLIC_BUILD_TAG=$BUILD_TAG \
    NUXT_PUBLIC_BUILD_SHA=$BUILD_SHA \
    NUXT_PUBLIC_BUILD_TIME=$BUILD_TIME

COPY --from=nodebuilder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]