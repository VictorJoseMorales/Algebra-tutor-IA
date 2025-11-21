
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Message, ProgressData, AlgebraProblem, TopicProgress, FillInTheBlankProblem } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audio';
import { useAttentionDetector } from '../hooks/useAttentionDetector';
import { MicIcon, BrainCircuitIcon, UserFocusIcon, UserOffIcon } from './Icons';
import Dashboard from './Dashboard';
import ProblemCard from './ProblemCard';
import VisualSolutionCard from './VisualSolutionCard';
import FillInTheBlankCard from './FillInTheBlankCard';
import PlaybackControls from './PlaybackControls';

const API_KEY = process.env.VITE_API_KEY;

const LOCAL_STORAGE_KEY_MESSAGES = 'algebra-tutor-messages';
const LOCAL_STORAGE_KEY_PROGRESS = 'algebra-tutor-progress';

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
    {
        name: 'displayVisualSolution',
        parameters: {
            type: Type.OBJECT,
            description: 'Muestra una solución paso a paso a un problema de álgebra de forma visual.',
            properties: {
                steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Un array de strings, donde cada string es un paso en la solución del problema.'
                },
            },
            required: ['steps'],
        },
    },
    {
        name: 'askFillInTheBlank',
        parameters: {
            type: Type.OBJECT,
            description: 'Plantea una pregunta kinestésica de rellenar el espacio en blanco al estudiante.',
            properties: {
                question: { type: Type.STRING, description: 'El texto de la pregunta, usando "[?]" para el espacio en blanco.' },
                answer: { type: Type.STRING, description: 'La respuesta correcta para el espacio en blanco.' },
            },
            required: ['question', 'answer'],
        },
    },
];

interface TutorViewProps {
    onEndSession: () => void;
}

const TutorView: React.FC<TutorViewProps> = ({ onEndSession }) => {
    const [messages, setMessages] = useState<Message[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY_MESSAGES);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [progress, setProgress] = useState<ProgressData>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
            return saved ? JSON.parse(saved) : { startTime: Date.now(), topics: {} };
        } catch { return { startTime: Date.now(), topics: {} }; }
    });

    const [isModelSpeaking, setIsModelSpeaking] = useState(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [activeQuestion, setActiveQuestion] = useState<{ id: string; data: FillInTheBlankProblem } | null>(null);
    const [questionFeedback, setQuestionFeedback] = useState<'correct' | 'incorrect' | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const sessionRef = useRef<any | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const attentionState = useAttentionDetector(videoRef);
    const scrollRef = useRef<HTMLDivElement>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const currentInputTranscription = useRef("");

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    }, [progress]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleTogglePause = useCallback(() => {
        if (!audioContextRef.current) return;
        if (isPaused) {
            audioContextRef.current.resume();
        } else {
            audioContextRef.current.suspend();
        }
        setIsPaused(prev => !prev);
    }, [isPaused]);

    const handleMessage = useCallback((message: LiveServerMessage) => {
        if (message.serverContent?.inputTranscription) {
            currentInputTranscription.current += message.serverContent.inputTranscription.text;
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'user') {
                    return [...prev.slice(0, -1), { ...lastMessage, text: currentInputTranscription.current }];
                }
                return [...prev, { id: `user-${Date.now()}`, role: 'user', text: currentInputTranscription.current }];
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
            for (const source of audioSourcesRef.current) {
                source.stop();
            }
            audioSourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsModelSpeaking(false);
        }

        if (message.toolCall?.functionCalls) {
            for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'generateAlgebraProblem') {
                    const problemData = fc.args as unknown as AlgebraProblem;
                    setMessages(prev => [...prev, { id: `problem-${Date.now()}`, role: 'problem', text: '', problemData }]);
                    sessionRef.current?.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } } });
                } else if (fc.name === 'trackProgress') {
                    const { topic, correctlySolved } = fc.args as unknown as { topic: string; correctlySolved: boolean };
                    setProgress(prev => {
                        const newTopics = { ...prev.topics };
                        const currentTopic: TopicProgress = newTopics[topic] || { attempted: 0, correct: 0 };
                        newTopics[topic] = {
                            attempted: currentTopic.attempted + 1,
                            correct: currentTopic.correct + (correctlySolved ? 1 : 0),
                        };
                        return { ...prev, topics: newTopics };
                    });
                     sessionRef.current?.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } } });
                } else if (fc.name === 'displayVisualSolution') {
                    const { steps } = fc.args as { steps: string[] };
                    setMessages(prev => [...prev, { id: `visual-${Date.now()}`, role: 'visual_solution', text: '', solutionSteps: steps }]);
                    sessionRef.current?.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } } });
                } else if (fc.name === 'askFillInTheBlank') {
                    const questionData = fc.args as unknown as FillInTheBlankProblem;
                    const questionId = `kinesthetic-${Date.now()}`;
                    setMessages(prev => [...prev, { id: questionId, role: 'kinesthetic_question', text: '', questionData }]);
                    setActiveQuestion({ id: fc.id, data: questionData });
                }
            }
        }

        if (message.serverContent?.turnComplete) {
            setIsUserSpeaking(false);
            if (activeQuestion && currentInputTranscription.current) {
                const userAnswer = currentInputTranscription.current.trim().toLowerCase();
                const correctAnswer = activeQuestion.data.answer.trim().toLowerCase();
                const isCorrect = userAnswer.includes(correctAnswer);

                setQuestionFeedback(isCorrect ? 'correct' : 'incorrect');
                setTimeout(() => {
                    sessionRef.current?.sendToolResponse({
                        functionResponses: { id: activeQuestion.id, name: 'askFillInTheBlank', response: { result: isCorrect ? "correct" : "incorrect", userAnswer: currentInputTranscription.current } }
                    });
                    setActiveQuestion(null);
                    setQuestionFeedback(null);
                }, 1500);
            }
            currentInputTranscription.current = "";
        }
        
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && audioContextRef.current) {
            const audioContext = audioContextRef.current;
            setIsModelSpeaking(true);

            const processAndPlay = async () => {
                try {
                    const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    
                    source.onended = () => {
                        audioSourcesRef.current.delete(source);
                        if (audioSourcesRef.current.size === 0) {
                            setIsModelSpeaking(false);
                            setIsPaused(false);
                        }
                    };
                    
                    const startTime = Math.max(audioContext.currentTime, nextStartTimeRef.current);
                    source.start(startTime);
                    
                    nextStartTimeRef.current = startTime + audioBuffer.duration;
                    audioSourcesRef.current.add(source);

                } catch (error) {
                    console.error("Error al reproducir audio:", error);
                }
            };
            processAndPlay();
        }
    }, [activeQuestion]);

    useEffect(() => {
        async function startSession() {
            if (!API_KEY) {
                setMessages([{ id: 'error-1', role: 'model', text: 'Error: La VITE_API_KEY no está configurada.' }]);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: API_KEY });
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            
            if (videoRef.current) videoRef.current.srcObject = mediaStream;

            const inputAudioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            
            const source = inputAudioContext.createMediaStreamSource(mediaStream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                const base64Data = encode(new Uint8Array(int16.buffer));
                
                sessionRef.current?.sendRealtimeInput({ media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' } });

                let sum = 0;
                for(let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / inputData.length);
                setIsUserSpeaking(rms > 0.01);
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

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
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: `Eres "Chip", un tutor de álgebra IA adaptativo, amigable y experto para estudiantes de secundaria. Tu objetivo es hacer el álgebra accesible y divertida.
                    - **Personalidad**: Eres paciente, alentador y usas analogías simples.
                    - **Aprendizaje Visual**: Cuando expliques un proceso de varios pasos, usa la función 'displayVisualSolution' para mostrarlo claramente.
                    - **Aprendizaje Auditivo**: Explica conceptos verbalmente de forma clara y concisa.
                    - **Aprendizaje Kinestésico**: Para reforzar un concepto, usa la función 'askFillInTheBlank'. Haz una pregunta donde el estudiante tenga que decir la respuesta para completar un paso. Evalúa su respuesta hablada.
                    - **Gestión de Problemas**: Cuando el usuario pida un problema, usa 'generateAlgebraProblem'. Después de que respondan, evalúa su solución y luego usa 'trackProgress' para registrar si fue correcta o no.
                    - **Detección de Atención**: Si el usuario parece distraído, pregunta amablemente si necesita un descanso o si quiere probar un enfoque diferente.
                    - **Inicio**: Comienza saludando al estudiante, presentándote como "Chip", y preguntándole qué tema de álgebra le gustaría trabajar hoy.`,
                },
            });
            
            sessionRef.current = await sessionPromise;
        }

        startSession();

        return () => {
            sessionRef.current?.close();
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
            audioContextRef.current?.close();
        };
    }, [handleMessage]);

    const AttentionIndicator = () => {
        switch (attentionState) {
            case 'focused': return <div className="flex items-center space-x-2 text-green-400"><UserFocusIcon className="w-5 h-5" /><span>Concentrado</span></div>;
            case 'distracted': return <div className="flex items-center space-x-2 text-yellow-400"><UserFocusIcon className="w-5 h-5 animate-pulse" /><span>Distraído</span></div>;
            case 'away': return <div className="flex items-center space-x-2 text-red-400"><UserOffIcon className="w-5 h-5" /><span>Ausente</span></div>;
            default: return null;
        }
    };

    return (
        <div className={`w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 p-4 bg-gray-800 rounded-2xl shadow-2xl border ${isUserSpeaking ? 'listening-animation' : 'border-gray-700'}`} style={{height: 'calc(100vh - 2rem)'}}>
            <div className="lg:w-1/4 flex-col space-y-4 hidden lg:flex">
                 <div className="w-full p-4 bg-gray-900 rounded-lg text-center">
                    <h2 className="text-xl font-bold text-cyan-400">Tutor de Álgebra "Chip"</h2>
                    <p className="text-gray-400 text-sm">Sesión en vivo</p>
                </div>
                <div className="flex-grow">
                    <Dashboard progress={progress} />
                </div>
                <button onClick={onEndSession} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                    Terminar Sesión
                </button>
            </div>
            
            <div className="flex-grow flex flex-col bg-gray-900 rounded-lg p-4 relative overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                    <video ref={videoRef} autoPlay muted className="w-48 h-36 rounded-lg border-2 border-cyan-500 object-cover"></video>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
                        <AttentionIndicator/>
                    </div>
                </div>

                <div ref={scrollRef} className="flex-grow flex flex-col items-start space-y-4 overflow-y-auto pr-2 pb-4">
                    {messages.map((msg) => {
                        if (msg.role === 'problem') {
                            return <ProblemCard key={msg.id} {...msg.problemData!} />;
                        }
                        if (msg.role === 'visual_solution') {
                            return <VisualSolutionCard key={msg.id} steps={msg.solutionSteps!} />;
                        }
                        if (msg.role === 'kinesthetic_question') {
                            return <FillInTheBlankCard key={msg.id} {...msg.questionData!} feedback={activeQuestion?.id.includes(msg.id) ? questionFeedback : null}/>;
                        }
                        return (
                            <div key={msg.id} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xl px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 self-end' : 'bg-gray-700 self-start'}`}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between px-4 bg-gray-900 rounded-lg border-t border-gray-700">
                    <div className="flex items-center space-x-3">
                        <MicIcon className={`w-6 h-6 ${isUserSpeaking ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
                        <span className="text-gray-400">{isUserSpeaking ? 'Escuchando...' : 'Habla para responder'}</span>
                    </div>
                     <div className="flex items-center space-x-3">
                        <BrainCircuitIcon className={`w-6 h-6 ${isModelSpeaking ? 'text-purple-400 animate-pulse' : 'text-gray-400'}`} />
                         <div className="flex items-center space-x-2">
                            <span className="text-gray-400">{isModelSpeaking ? 'Chip hablando...' : 'Esperando'}</span>
                            {isModelSpeaking && <PlaybackControls isPaused={isPaused} onTogglePause={handleTogglePause} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TutorView;