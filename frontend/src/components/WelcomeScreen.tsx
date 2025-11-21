import React from 'react';
import type { AppStatus } from '../App';
import { CameraIcon, MicIcon } from './Icons';

interface WelcomeScreenProps {
    onStart: () => void;
    status: AppStatus;
    error: string | null;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, status, error }) => {
    const getButtonText = () => {
        switch (status) {
            case 'requesting_permissions':
                return 'Solicitando Permisos...';
            case 'permissions_denied':
                return 'Reintentar';
            default:
                return 'Comenzar Sesión de Tutoría';
        }
    };

    return (
        <div className="text-center max-w-2xl mx-auto p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
            <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-4">
                Bienvenido al Tutor de Álgebra IA "Chip"
            </h1>
            <p className="text-lg text-gray-300 mb-6">
                Una experiencia de aprendizaje interactiva que se adapta a ti. Usaremos tu cámara y micrófono para entender tu nivel de atención y ofrecerte la mejor ayuda posible.
            </p>
            <div className="flex justify-center space-x-8 my-8">
                <div className="flex flex-col items-center space-y-2">
                    <CameraIcon className="w-12 h-12 text-purple-400" />
                    <span className="text-gray-400">Detección de Atención</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <MicIcon className="w-12 h-12 text-green-400" />
                    <span className="text-gray-400">Tutoría por Voz</span>
                </div>
            </div>
            {status === 'permissions_denied' && error && (
                <p className="text-red-400 mb-4 bg-red-900/50 p-3 rounded-md border border-red-700">
                    <strong>Error de Permisos:</strong> {error}
                </p>
            )}
            <button
                onClick={onStart}
                disabled={status === 'requesting_permissions'}
                className="w-full md:w-auto px-8 py-4 bg-cyan-500 text-white font-bold rounded-lg hover:bg-cyan-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
            >
                {getButtonText()}
            </button>
        </div>
    );
};

export default WelcomeScreen;
