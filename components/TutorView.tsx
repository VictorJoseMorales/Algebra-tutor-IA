import React, { useEffect, useRef, useState } from 'react';
import { useAttentionDetector } from '../hooks/useAttentionDetector';
import { useAudioSession } from '../hooks/useAudioSession';
import { useGenAI } from '../hooks/useGenAI';
import { MicIcon, BrainCircuitIcon, UserFocusIcon, UserOffIcon, BarChartIcon, CameraIcon } from './Icons';
import Dashboard from './Dashboard';
import ProblemCard from './ProblemCard';

interface TutorViewProps {
    onEndSession: () => void;
}

const TutorView: React.FC<TutorViewProps> = ({ onEndSession }) => {
    const [isDashboardVisible, setIsDashboardVisible] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const attentionState = useAttentionDetector(videoRef);

    const {
        isUserSpeaking,
        isModelSpeaking,
        setIsUserSpeaking,
        initializeAudio,
        playAudio,
        stopAudio,
        cleanup: cleanupAudio
    } = useAudioSession();

    const {
        messages,
        progress,
        connect: connectAI,
        disconnect: disconnectAI,
        sendRealtimeInput,
        sendImageInput
    } = useGenAI({
        onAudioOutput: playAudio,
        onInterrupted: stopAudio,
        onTurnComplete: () => setIsUserSpeaking(false)
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        async function startSession() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                if (videoRef.current) videoRef.current.srcObject = mediaStream;

                await initializeAudio(mediaStream, sendRealtimeInput);
                await connectAI();
            } catch (error) {
                console.error("Failed to start session:", error);
            }
        }

        startSession();

        return () => {
            disconnectAI();
            cleanupAudio();
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, [initializeAudio, connectAI, disconnectAI, cleanupAudio, sendRealtimeInput]);

    const captureFrame = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
                sendImageInput(base64Data);
            }
        }
    };

    const AttentionIndicator = () => {
        switch (attentionState) {
            case 'focused': return <div className="flex items-center space-x-2 text-green-400"><UserFocusIcon className="w-4 h-4" /><span className="text-xs tracking-wider font-mono">CONCENTRADO</span></div>;
            case 'distracted': return <div className="flex items-center space-x-2 text-yellow-400"><UserFocusIcon className="w-4 h-4 animate-pulse" /><span className="text-xs tracking-wider font-mono">DISTRAÍDO</span></div>;
            case 'away': return <div className="flex items-center space-x-2 text-red-400"><UserOffIcon className="w-4 h-4" /><span className="text-xs tracking-wider font-mono">AUSENTE</span></div>;
            default: return null;
        }
    };

    return (
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-4" style={{ height: 'calc(100vh - 2rem)' }}>
            {isDashboardVisible && <Dashboard progress={progress} onClose={() => setIsDashboardVisible(false)} />}

            {/* Main Interface */}
            <div className="flex-grow flex flex-col glass-panel rounded-2xl relative overflow-hidden border-cyan-500/20">
                {/* Header HUD */}
                <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/50 to-transparent flex items-center justify-between px-6 z-20 border-b border-white/5">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isUserSpeaking ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
                            <span className="text-xs text-gray-400 font-mono">MIC INPUT</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isModelSpeaking ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`}></div>
                            <span className="text-xs text-gray-400 font-mono">AI CORE</span>
                        </div>
                    </div>
                    <div className="text-xs text-cyan-500/50 font-mono">SYS.VER.2.0.4</div>
                </div>

                {/* Video Feed (HUD Style) */}
                <div className="absolute top-16 right-6 z-10 w-64 group">
                    <div className="relative rounded-lg overflow-hidden border border-cyan-500/30 bg-black/40 backdrop-blur-sm shadow-lg transition-all hover:scale-105 hover:border-cyan-400">
                        <video ref={videoRef} autoPlay muted className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity"></video>

                        {/* HUD Overlays */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50"></div>

                        <button
                            onClick={captureFrame}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 text-cyan-400 text-xs font-mono py-2 px-4 rounded-full transition-all flex items-center space-x-2 backdrop-blur-md opacity-0 group-hover:opacity-100 z-20 hover:scale-110"
                        >
                            <CameraIcon className="w-4 h-4" />
                            <span>ESCANEAR</span>
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-2 border-t border-white/10 flex justify-between items-center">
                            <AttentionIndicator />
                            <div className="text-[10px] text-cyan-500 font-mono animate-pulse">LIVE FEED</div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-grow flex flex-col space-y-6 overflow-y-auto p-6 pt-16 pb-24 scroll-smooth">
                    {messages.map((msg) => {
                        if (msg.role === 'problem' && msg.problemData) {
                            return (
                                <div key={msg.id} className="animate-float">
                                    <ProblemCard {...msg.problemData} />
                                </div>
                            );
                        }
                        const isUser = msg.role === 'user';
                        return (
                            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-2xl p-4 rounded-2xl backdrop-blur-md border ${isUser
                                    ? 'bg-cyan-500/10 border-cyan-500/30 rounded-tr-none text-cyan-50'
                                    : 'bg-purple-500/10 border-purple-500/30 rounded-tl-none text-purple-50'
                                    } shadow-lg`}>
                                    <div className="flex items-center space-x-2 mb-2 opacity-50">
                                        <span className="text-xs font-mono uppercase">{isUser ? 'ESTUDIANTE' : 'TUTOR AI'}</span>
                                        <span className="text-[10px]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Input Status Bar */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent border-t border-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-center space-x-8">
                        <div className={`flex items-center space-x-3 px-6 py-3 rounded-full border transition-all duration-500 ${isUserSpeaking
                            ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            : 'bg-white/5 border-white/10'
                            }`}>
                            <MicIcon className={`w-6 h-6 ${isUserSpeaking ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
                            <span className={`font-mono text-sm ${isUserSpeaking ? 'text-green-400' : 'text-gray-400'}`}>
                                {isUserSpeaking ? 'DETECTANDO VOZ...' : 'ESCUCHANDO'}
                            </span>
                        </div>

                        <div className={`flex items-center space-x-3 px-6 py-3 rounded-full border transition-all duration-500 ${isModelSpeaking
                            ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                            : 'bg-white/5 border-white/10'
                            }`}>
                            <BrainCircuitIcon className={`w-6 h-6 ${isModelSpeaking ? 'text-purple-400 animate-pulse' : 'text-gray-400'}`} />
                            <span className={`font-mono text-sm ${isModelSpeaking ? 'text-purple-400' : 'text-gray-400'}`}>
                                {isModelSpeaking ? 'PROCESANDO RESPUESTA...' : 'EN ESPERA'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:w-80 flex flex-col space-y-4">
                <div className="glass-panel p-6 rounded-2xl text-center border border-cyan-500/20">
                    <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                        <BrainCircuitIcon className="w-8 h-8 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">PANEL DE CONTROL</h2>
                    <p className="text-cyan-400/60 text-xs font-mono">CONEXIÓN ESTABLECIDA</p>
                </div>

                <button onClick={() => setIsDashboardVisible(true)} className="group w-full py-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500/30 transition-all flex items-center justify-center space-x-3 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <BarChartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>VER ESTADÍSTICAS</span>
                </button>

                <div className="flex-grow glass-panel rounded-2xl p-4 border border-white/5 flex flex-col justify-end">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>LATENCIA</span>
                            <span className="text-green-400">12ms</span>
                        </div>
                        <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[90%]"></div>
                        </div>
                    </div>
                    <button onClick={onEndSession} className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-colors text-sm tracking-widest hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        TERMINAR ENLACE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorView;