FROM node:22-alpine AS production
RUN addgroup -g 1001 heady && adduser -u 1001 -G heady -s /bin/sh -D heady
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev 2>/dev/null; true
COPY server.js serve.json ./
COPY dist/ ./dist/
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
USER heady
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["node", "server.js"]
