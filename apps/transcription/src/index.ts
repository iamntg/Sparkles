import express from "express";
import multer from "multer";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execFileAsync = promisify(execFile);
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Temp folder for uploaded audio files ───────────────────────────────────
const UPLOAD_DIR = "/tmp/whisper-uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Multer: accepts audio file uploaded as "audio" field ───────────────────
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// ─── Whisper binary + model paths (set by Dockerfile) ───────────────────────
const WHISPER_BIN   = process.env.WHISPER_BIN   || "/app/whisper.cpp/build/bin/whisper-cli";
const WHISPER_MODEL = process.env.WHISPER_MODEL || "/app/models/ggml-base.en.bin";

// ─── Health check — Render uses this to know the server is alive ─────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── POST /transcribe ────────────────────────────────────────────────────────
// Your mobile/web app sends audio here, gets back { transcript: "..." }
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  const uploadedFile = req.file?.path;

  try {
    if (!req.file) {
      res.status(400).json({ error: "No audio file provided" });
      return;
    }

    // 1. Convert audio → 16kHz mono WAV (Whisper requires this format)
    const wavPath = uploadedFile + ".wav";
    await execFileAsync("ffmpeg", [
      "-y",                 // overwrite output if exists
      "-i", uploadedFile!,  // input: m4a, mp3, webm, whatever the app sent
      "-ar", "16000",       // 16kHz sample rate
      "-ac", "1",           // mono channel
      "-c:a", "pcm_s16le",  // 16-bit PCM encoding
      wavPath,
    ], { timeout: 30_000 });

    // 2. Run Whisper on the WAV file
    const { stdout } = await execFileAsync(WHISPER_BIN, [
      "-m", WHISPER_MODEL,  // path to ggml-base.en.bin
      "-f", wavPath,        // audio file to transcribe
      "--no-timestamps",    // skip [00:00] timestamps in output
      "-t", "4",            // 4 threads — safe for Render free tier
      "-l", "en",           // language: English
      "--output-txt",       // plain text output (goes to stdout)
    ], { timeout: 55_000, maxBuffer: 10 * 1024 * 1024 });

    // 3. Delete the temp files
    for (const f of [uploadedFile, wavPath]) {
      if (f && fs.existsSync(f)) fs.unlinkSync(f);
    }

    // 4. Send the transcript back
    const transcript = stdout.trim();
    console.log(`[transcribe] Done — ${transcript.length} chars`);
    res.json({ transcript });

  } catch (err: any) {
    if (uploadedFile && fs.existsSync(uploadedFile)) fs.unlinkSync(uploadedFile);
    console.error("[transcribe] Error:", err.message);
    res.status(500).json({ error: err.message || "Transcription failed" });
  }
});

app.listen(PORT, () => {
  console.log(`[sparkles] Server running on port ${PORT}`);
});
