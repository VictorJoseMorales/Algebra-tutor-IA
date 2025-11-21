import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import type { AppStatus } from '../App';
import { CameraIcon, MicIcon, BrainCircuitIcon, QrCodeIcon } from './Icons';

interface WelcomeScreenProps {
    onStart: () => void;
    status: AppStatus;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, status }) => {
    const [showQR, setShowQR] = useState(false);

    const getButtonText = () => {
        switch (status) {
            case 'requesting_permissions':
                return 'INICIALIZANDO SISTEMA...';
            case 'permissions_denied':
                return 'ACCESO DENEGADO. REINTENTAR.';
            default:
                return 'INICIAR ENLACE NEURAL';
        }
    };

    return (
        <div className="glass-panel p-12 rounded-3xl max-w-3xl w-full mx-4 text-center relative overflow-hidden border border-cyan-500/30">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

            <div className="relative z-10">
                <div className="mb-8 inline-block p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-float">
                    <BrainCircuitIcon className="w-16 h-16 text-cyan-400" />
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 tracking-tight text-glow">
                    ÁLGEBRA AI
                </h1>

                <p className="text-xl text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed">
                    Sistema de tutoría adaptativa de próxima generación.
                    <span className="block mt-2 text-cyan-400/80 text-sm uppercase tracking-widest">Estado: Esperando Usuario</span>
                </p>

                <div className="grid grid-cols-2 gap-6 mb-12 max-w-lg mx-auto">
                    <div className="glass-card p-4 rounded-xl flex flex-col items-center space-y-3 group hover:bg-cyan-500/10 transition-colors">
                        <CameraIcon className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-gray-400 group-hover:text-cyan-300">Escaneo Visual</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-400">ONLINE</span>
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-xl flex flex-col items-center space-y-3 group hover:bg-purple-500/10 transition-colors">
                        <MicIcon className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-gray-400 group-hover:text-purple-300">Enlace de Voz</span>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-400">ONLINE</span>
                        </div>
                    </div>
                </div>

                {status === 'permissions_denied' && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-left">
                        <p className="font-bold mb-1">⚠ ERROR CRÍTICO: Acceso denegado</p>
                        <p>El navegador bloqueó el acceso a la cámara o micrófono.</p>
                        <ul className="list-disc list-inside mt-2 opacity-80">
                            <li>Haz clic en el 🔒 (candado) en la barra de dirección.</li>
                            <li>Activa los permisos de "Cámara" y "Micrófono".</li>
                            <li>Recarga la página e intenta de nuevo.</li>
                        </ul>
                    </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onStart}
                        disabled={status === 'requesting_permissions'}
                        className="group relative px-8 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold rounded-lg border border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden w-full md:w-auto"
                    >
                        <span className="relative z-10 tracking-widest">{getButtonText()}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    </button>

                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="px-6 py-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold rounded-lg border border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 flex items-center justify-center space-x-2 w-full md:w-auto"
                    >
                        <QrCodeIcon className="w-5 h-5" />
                        <span>{showQR ? 'OCULTAR QR' : 'COMPARTIR'}</span>
                    </button>
                </div>

                {showQR && (
                    <div className="mt-8 p-4 bg-white rounded-xl inline-block animate-fade-in">
                        <QRCode value={window.location.href} size={128} />
                        <p className="mt-2 text-black font-mono text-xs">ESCANEAR PARA ACCEDER</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WelcomeScreen;
