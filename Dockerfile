# This Dockerfile uses `serve` npm package to serve the static files with node process.
# You can find the Dockerfile for nginx in the following link:
# https://github.com/refinedev/dockerfiles/blob/main/vite/Dockerfile.nginx
FROM refinedev/node:18 AS base

FROM base as deps

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base as builder

COPY --from=deps /app/refine/node_modules ./node_modules
COPY . .

# Add build-time variables
ARG VITE_LINE_CLIENT_ID
ARG VITE_ADMIN_URL
ARG VITE_CALLBACK_DOMAIN
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set them as environment variables
ENV VITE_LINE_CLIENT_ID=$VITE_LINE_CLIENT_ID
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
ENV VITE_CALLBACK_DOMAIN=$VITE_CALLBACK_DOMAIN
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

FROM base as runner

ENV NODE_ENV production

RUN npm install -g serve

COPY --from=builder /app/refine/dist ./

USER refine

# Pass runtime environment variables
ENV VITE_LINE_CLIENT_ID=$VITE_LINE_CLIENT_ID
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
ENV VITE_CALLBACK_DOMAIN=$VITE_CALLBACK_DOMAIN
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

CMD ["serve", "-s", ".", "-l", "3000"]
