FROM node:24-alpine
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG PAYLOAD_SECRET
ARG DATABASE_URL=file:/tmp/build.db
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

RUN mkdir -p /app/db /app/media \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && chown -R nextjs:nodejs /app /app/db /app/media

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production

CMD sh -c "node_modules/.bin/payload migrate && node_modules/.bin/next start"