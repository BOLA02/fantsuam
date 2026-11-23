
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN DATABASE_URL="mysql://placeholder:placeholder@127.0.0.1:3306/placeholder" \
    npx prisma generate

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
