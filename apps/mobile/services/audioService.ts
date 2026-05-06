import { AudioModule, type AudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';

let recorder: AudioRecorder | null = null;

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
        
        await recorder.stop();
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
