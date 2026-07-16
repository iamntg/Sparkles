# Screenshots

UI captures used in the root [`README.md`](../../README.md).

| File | Screen | Route |
| --- | --- | --- |
| `constellation.png` | Home constellation (populated) | `/constellation` |
| `stream.png` | The Stream — searchable idea list | `/inbox` |
| `capture.png` | New-spark capture | `/add` |
| `detail.png` | Idea details | `/develop/[id]` |
| `develop.png` | Develop a single idea | `/develop/[id]` |
| `settings.png` | Backup & AI preferences | `/settings` |

## How they were captured

Real renders of the app's **web build** (`react-native-web`) at a 430×932
mobile viewport (`@2x`), with a handful of sample ideas seeded first.

To refresh them:

1. Start the app: `pnpm --filter @sparkles/mobile dev` (press `w` for web, or it
   serves on `http://localhost:8081`).
2. Add a few ideas so the constellation and Stream aren't empty.
3. Capture each screen at a mobile viewport — a headless browser works well, e.g.
   `chrome --headless=new --window-size=430,932 --force-device-scale-factor=2
   --screenshot=constellation.png http://localhost:8081/constellation`.
4. Save into this folder using the file names above.
