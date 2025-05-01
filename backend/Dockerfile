# Use a slim base (alpine is fine if you have no native deps)
FROM node:18-alpine

WORKDIR /app

# 1) Only copy your lockfile + package.json so you can leverage layer caching
COPY package*.json ./

# 2) Tell npm you're in production, and use CI for a clean, reproducible install
ENV NODE_ENV=production
RUN npm ci --omit=dev

# 3) Now copy the rest of your source
COPY . .

# 4) Cloud Run will always set $PORT (it defaults to 8080)
#    So expose 8080 (EXPOSE is just documentation, but good to match your code)
ENV PORT=8080
EXPOSE 8080

# 5) Start your server (make sure your code listens on process.env.PORT)
CMD ["node", "server.js"]
