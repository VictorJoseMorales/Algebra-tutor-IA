import { useRef, useState, useCallback, useEffect } from 'react';
import { encode, decode, decodeAudioData } from '../utils/audio';

export const useAudioSession = () => {
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [isModelSpeaking, setIsModelSpeaking] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const nextStartTimeRef = useRef(0);

    const initializeAudio = useCallback(async (mediaStream: MediaStream, onAudioData: (base64Data: string) => void) => {
        const inputAudioContext = new AudioContext({ sampleRate: 16000 });
        const outputAudioContext = new AudioContext({ sampleRate: 24000 });

        inputAudioContextRef.current = inputAudioContext;
        audioContextRef.current = outputAudioContext;

        const source = inputAudioContext.createMediaStreamSource(mediaStream);
        const gainNode = inputAudioContext.createGain();
        gainNode.gain.value = 2.0; // Boost volume by 2x

        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            const base64Data = encode(new Uint8Array(int16.buffer));

            onAudioData(base64Data);

            let sum = 0;
            for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
            const rms = Math.sqrt(sum / inputData.length);
            setIsUserSpeaking(rms > 0.01);
        };

        source.connect(gainNode);
        gainNode.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
    }, []);

    const playAudio = useCallback(async (base64Audio: string) => {
        if (!audioContextRef.current) return;

        try {
            setIsModelSpeaking(true);
            const audioContext = audioContextRef.current;
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);

            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);

            source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                    setIsModelSpeaking(false);
                }
            };

            const startTime = Math.max(audioContext.currentTime, nextStartTimeRef.current);
            source.start(startTime);

            nextStartTimeRef.current = startTime + audioBuffer.duration;
            audioSourcesRef.current.add(source);
        } catch (error) {
            console.error("Error playing audio:", error);
            setIsModelSpeaking(false);
        }
    }, []);

    const stopAudio = useCallback(() => {
        for (const source of audioSourcesRef.current) {
            source.stop();
        }
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setIsModelSpeaking(false);
    }, []);

    const cleanup = useCallback(() => {
        inputAudioContextRef.current?.close();
        audioContextRef.current?.close();
        stopAudio();
    }, [stopAudio]);

    return {
        isUserSpeaking,
        isModelSpeaking,
        setIsUserSpeaking, // Exposed for manual override if needed (e.g. turnComplete)
        initializeAudio,
        playAudio,
        stopAudio,
        cleanup
    };
};
