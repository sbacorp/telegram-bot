FROM node:lts-slim AS base

# Create app directory
WORKDIR /usr/src

FROM base AS builder

# Files required by npm install
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

FROM base AS runner

# Bundle app source
COPY . .

# Install only production app dependencies
RUN npm ci --omit=dev

USER node

# Start the app
EXPOSE 80
EXPOSE 3000
CMD ["npm", "run", "start:force"]
