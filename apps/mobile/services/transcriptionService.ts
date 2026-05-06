import * as FileSystem from "expo-file-system/legacy";
import { FileSystemUploadType } from "expo-file-system/legacy";

const BASE_URL = process.env.EXPO_PUBLIC_TRANSCRIPTION_URL;

if (!BASE_URL) {
    console.warn("[transcription] EXPO_PUBLIC_TRANSCRIPTION_URL is not set in your .env file");
}

/**
 * Send a recorded audio file to the transcription server.
 *
 * @param localUri - the URI returned by Expo's recording, e.g. file:///var/...
 * @returns the transcribed text string
 */
export async function transcribeAudio(localUri: string): Promise<string> {
    // 1. Make sure the file actually exists before sending
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (!fileInfo.exists) {
        throw new Error("Audio file not found: " + localUri);
    }

    // 2. Get the filename from the URI (e.g. "recording-123.m4a")
    const filename = localUri.split("/").pop() ?? "recording.m4a";

    // 3. Upload the file — Using the legacy API from 'expo-file-system/legacy' 
    //    as the root exports in SDK 52+ are deprecated and throw at runtime.
    const response = await FileSystem.uploadAsync(
        `${BASE_URL}/transcribe`,
        localUri,
        {
            httpMethod: "POST",
            uploadType: FileSystemUploadType.MULTIPART,
            fieldName: "audio",          // must match what the server expects
            mimeType: getMimeType(filename),
            headers: { Accept: "application/json" },
        }
    );

    // 4. Handle errors from the server
    if (response.status !== 200) {
        let message = `Server error (${response.status})`;
        try {
            const body = JSON.parse(response.body);
            if (body.error) message = body.error;
        } catch {
            console.log(response);
        }
        throw new Error(message);
    }

    // 5. Parse and return the transcript
    const body = JSON.parse(response.body);
    return body.transcript ?? "";

}

// ─── Helper ──────────────────────────────────────────────────────────────────
function getMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const types: Record<string, string> = {
        m4a: "audio/m4a",
        mp4: "audio/mp4",
        mp3: "audio/mpeg",
        wav: "audio/wav",
        aac: "audio/aac",
        webm: "audio/webm",
    };
    return types[ext ?? ""] ?? "audio/m4a";
}
