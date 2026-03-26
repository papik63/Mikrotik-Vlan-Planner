FROM node:20-alpine

# Security: run as non-root user
# node:20-alpine ships with a "node" user (uid 1000)
WORKDIR /app

# Install dependencies as root (needed to write to /app)
# then switch ownership before running the app
COPY package.json package-lock.json* ./

# Use npm ci instead of npm install:
#   - Requires package-lock.json (reproducible installs)
#   - Fails on lock file mismatch (detects supply-chain tampering)
#   - Faster than npm install in CI/CD
RUN npm ci --ignore-scripts

# Copy source after deps — better layer caching
COPY --chown=node:node . .

# Drop root — run as unprivileged "node" user
USER node

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
