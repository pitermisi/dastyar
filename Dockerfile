FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for Prisma engine support
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy dependency specifications
COPY package*.json ./

# Install dependencies (all needed for build step)
RUN npm install

# Copy source files
COPY . .

# Generate Prisma client and compile production bundles
RUN npm run build

# Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["npm", "start"]
