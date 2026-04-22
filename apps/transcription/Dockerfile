# ── Stage 1: Compile whisper.cpp ──────────────────────────────────────────────
FROM debian:bookworm-slim AS whisper-builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    git build-essential cmake ca-certificates wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Clone whisper.cpp (pinned version for stability)
RUN git clone --depth 1 --branch v1.7.4 \
    https://github.com/ggml-org/whisper.cpp.git

WORKDIR /build/whisper.cpp

# Compile (CPU only — Render free tier has no GPU)
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --config Release -j$(nproc)

# ── Stage 2: Download the AI model ────────────────────────────────────────────
FROM debian:bookworm-slim AS model-downloader

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /models

# base.en = 142MB — best fit for Render free tier (512MB RAM)
# DO NOT use small/medium/large — they will crash with out-of-memory
RUN wget -q "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin" \
    -O ggml-base.en.bin \
    && echo "Downloaded: $(du -sh ggml-base.en.bin)"

# ── Stage 3: Build the Node.js server ─────────────────────────────────────────
FROM node:20-slim AS node-builder

WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build

# ── Stage 4: Final image (what actually runs on Render) ───────────────────────
FROM debian:bookworm-slim

# ffmpeg converts m4a/mp3/webm → wav before sending to Whisper
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg nodejs npm ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy whisper binary
COPY --from=whisper-builder /build/whisper.cpp/build/bin/whisper-cli /app/whisper.cpp/build/bin/whisper-cli
RUN chmod +x /app/whisper.cpp/build/bin/whisper-cli

# Copy AI model
COPY --from=model-downloader /models/ggml-base.en.bin /app/models/ggml-base.en.bin

# Copy Node server
COPY --from=node-builder /app/dist ./dist
COPY --from=node-builder /app/node_modules ./node_modules

# Environment variables (Render sets PORT automatically)
ENV WHISPER_BIN=/app/whisper.cpp/build/bin/whisper-cli
ENV WHISPER_MODEL=/app/models/ggml-base.en.bin
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/index.js"]
