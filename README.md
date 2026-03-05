# Sparkles

A local-first ideas app built with Expo, SQLite, and Skia. Features a constellation visualizer and encrypted local vault backups.

## Structure

- `apps/mobile`: Expo React Native app
- `apps/web`: Web app scaffold
- `packages/core`: Core domain models and types
- `packages/db`: SQLite database schema, migrations, and repositories
- `packages/crypto`: Vault encryption and backups
- `packages/ai`: Local clustering
- `packages/ui`: Reusable UI components

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start development mode:
   ```bash
   pnpm dev
   ```

## Local Database

The database is powered by SQLite and runs entirely locally. Repositories in `packages/db` abstract direct SQL operations to return `packages/core` models.

## Vault system

Using PBKDF2 for key derivation and AES-GCM for encryption. No passphrases are saved anywhere on device. See `packages/crypto`.
