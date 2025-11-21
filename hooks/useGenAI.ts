import { useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { Message, AlgebraProblem, ProgressData, TrackProgressArgs } from '../types';
import { usePersistence } from './usePersistence';

const API_KEY = import.meta.env.VITE_API_KEY;

const algebraTools: FunctionDeclaration[] = [
    {
        name: 'generateAlgebraProblem',
        parameters: {
            type: Type.OBJECT,
            description: 'Genera un nuevo problema de álgebra basado en el tema actual y la dificultad de la conversación.',
            properties: {
                topic: { type: Type.STRING, description: 'El tema del problema, ej. "Ecuaciones Lineales".' },
                problem: { type: Type.STRING, description: 'El texto del problema de álgebra.' },
                difficulty: { type: Type.STRING, description: 'El nivel de dificultad, ej. "Fácil", "Medio", "Difícil".' },
            },
            required: ['topic', 'problem', 'difficulty'],
        },
    },
    {
        name: 'trackProgress',
        parameters: {
            type: Type.OBJECT,
            description: 'Registra el progreso del estudiante en un problema dado.',
            properties: {
                topic: { type: Type.STRING, description: 'El tema del problema de álgebra.' },
                correctlySolved: { type: Type.BOOLEAN, description: 'Si el usuario resolvió el problema correctamente.' },
            },
            required: ['topic', 'correctlySolved'],
        },
    },
];

interface UseGenAIProps {
    onAudioOutput: (base64Audio: string) => void;
    onInterrupted: () => void;
    onTurnComplete: () => void;
}

export const useGenAI = ({ onAudioOutput, onInterrupted, onTurnComplete }: UseGenAIProps) => {
    const { messages, setMessages, progress, setProgress, clearSession } = usePersistence(
        [],
        { topics: new Set(), attempted: 0, correct: 0, startTime: Date.now() }
    );

    const sessionRef = useRef<any | null>(null);

    const handleMessage = useCallback((message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
            const text = message.serverContent.inputTranscription.text;
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'user') {
                    return [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + text }];
                }
                return [...prev, { id: `user-${Date.now()}`, role: 'user', text }];
            });
        }

        if (message.serverContent?.outputTranscription) {
            const text = message.serverContent.outputTranscription.text;
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'model') {
                    return [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + text }];
                }
                return [...prev, { id: `model-${Date.now()}`, role: 'model', text }];
            });
        }

        if (message.serverContent?.interrupted) {
            onInterrupted();
        }

        if (message.toolCall?.functionCalls) {
            for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'generateAlgebraProblem') {
                    const problemData = fc.args as unknown as AlgebraProblem;
                    setMessages(prev => [...prev, { id: `problem-${Date.now()}`, role: 'problem', text: 'Aquí tienes un problema para practicar:', problemData }]);
                    sessionRef.current?.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } } });
                } else if (fc.name === 'trackProgress') {
                    const { topic, correctlySolved } = fc.args as unknown as TrackProgressArgs;
                    setProgress(prev => ({
                        ...prev,
                        topics: new Set(prev.topics).add(topic),
                        attempted: prev.attempted + 1,
                        correct: prev.correct + (correctlySolved ? 1 : 0),
                    }));
                    sessionRef.current?.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } } });
                }
            }
        }

        if (message.serverContent?.turnComplete) {
            onTurnComplete();
        }

        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
            onAudioOutput(base64Audio);
        }
    }, [onAudioOutput, onInterrupted, onTurnComplete, setMessages, setProgress]);

    const connect = useCallback(async () => {
        if (!API_KEY) {
            alert("API_KEY no está configurada.");
            return;
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => console.log('Sesión abierta.'),
                onmessage: handleMessage,
                onerror: (e) => console.error('Error de sesión:', e),
                onclose: () => console.log('Sesión cerrada.'),
            },
            config: {
                responseModalities: [Modality.AUDIO],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                tools: [{ functionDeclarations: algebraTools }],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }, },
                systemInstruction: `Eres un tutor de álgebra IA adaptativo, amigable y experto para estudiantes. Tu objetivo es explicar conceptos claramente y guiar a los estudiantes. Cuando el usuario pida un problema, usa la función 'generateAlgebraProblem'. Basado en la conversación, elige un tema y dificultad apropiados. Después de que el usuario responda, evalúa su respuesta. Luego, usa la función 'trackProgress' para registrar el resultado, especificando el tema y si la respuesta fue correcta. Si el usuario parece distraído, pregunta amablemente si necesita un descanso. Comienza saludando al estudiante y preguntándole qué tema de álgebra le gustaría trabajar.`,
            },
        });

        sessionRef.current = await sessionPromise;
    }, [handleMessage]);

    const sendRealtimeInput = useCallback((base64Data: string, mimeType: string = 'audio/pcm;rate=16000') => {
        sessionRef.current?.sendRealtimeInput({ media: { data: base64Data, mimeType } });
    }, []);

    const sendImageInput = useCallback((base64Data: string) => {
        sendRealtimeInput(base64Data, 'image/jpeg');
    }, [sendRealtimeInput]);

    const disconnect = useCallback(() => {
        sessionRef.current?.close();
    }, []);

    return {
        messages,
        progress,
        connect,
        disconnect,
        sendRealtimeInput,
        sendImageInput,
        clearSession, // Exposed to allow clearing data
        setMessages,
        setProgress
    };
};
