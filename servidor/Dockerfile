FROM node:24-alpine
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3010
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node src ./src
USER node
EXPOSE 3010
CMD ["node", "src/index.js"]
