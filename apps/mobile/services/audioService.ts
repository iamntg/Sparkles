import { AudioModule, type AudioRecorder, type AudioPlayer, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, createAudioPlayer } from 'expo-audio';

let recorder: AudioRecorder | null = null;
let player: AudioPlayer | null = null;

export async function startRecording(): Promise<void> {
    try {
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
            throw new Error('Permission to access microphone was denied');
        }

        await setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
        });

        recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
        await recorder.prepareToRecordAsync();
        recorder.record();
    } catch (err) {
        console.error('Failed to start recording', err);
        throw err;
    }
}

export async function stopRecording(): Promise<string> {
    try {
        if (!recorder) {
            throw new Error('No recording active');
        }
        
        // Add a small delay to prevent "failed to stop cleanly" on Android if stopped too quickly
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            await recorder.stop();
        } catch (stopErr) {
            console.warn('Warning during stop:', stopErr);
        }

        const uri = recorder.uri;
        
        await setAudioModeAsync({
            allowsRecording: false,
        });

        recorder = null;
        if (!uri) throw new Error('Failed to get recording URI');
        return uri;
    } catch (err) {
        console.error('Failed to stop recording', err);
        recorder = null;
        throw err;
    }
}


export async function playAudio(uri: string): Promise<void> {
    try {
        if (player) {
            player.pause();
        }
        await setAudioModeAsync({
            playsInSilentMode: true,
        });
        player = createAudioPlayer(uri);
        player.play();
    } catch (err) {
        console.error('Failed to play audio', err);
        throw err;
    }
}

export async function stopAudio(): Promise<void> {
    try {
        if (player) {
            player.pause();
        }
    } catch (err) {
        console.error('Failed to stop playback', err);
        throw err;
    }
}
