
FROM node:22-bookworm-slim

# Install tools needed to download Arduino CLI
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Install Arduino CLI
RUN curl -fsSL \
    https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Linux_64bit.tar.gz \
    | tar -xz -C /usr/local/bin arduino-cli

# Install the Arduino Uno board platform
RUN arduino-cli version \
    && arduino-cli core update-index \
    && arduino-cli core install arduino:avr

WORKDIR /app

# Install backend dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy backend source and bundled libraries
COPY . .

# Generate Prisma Client and compile TypeScript
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rde_dev" npm run build

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
