export async function transcribeAudio(uri: string): Promise<string> {
    // Mock transcription returning placeholder text after a delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("This is a simulated transcription of the recorded audio idea.");
        }, 1500);
    });
}
