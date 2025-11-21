
import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TutorView from './components/TutorView';

export type AppStatus = 'idle' | 'requesting_permissions' | 'permissions_denied' | 'active';

const App: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>('idle');
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const handleStartSession = useCallback(async () => {
        setStatus('requesting_permissions');
        setPermissionError(null);
        try {
            // Solicitamos permisos de audio y video
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setStatus('active');
        } catch (error) {
            console.error("Permissions error:", error);
            setStatus('permissions_denied');
            if (error instanceof DOMException) {
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    setPermissionError('Has denegado el permiso para acceder al micrófono y/o la cámara. Por favor, habilítalos en la configuración de tu navegador y recarga la página.');
                } else if (error.name === 'NotFoundError') {
                    setPermissionError('No se ha encontrado un micrófono o cámara en tu dispositivo. Por favor, conecta los dispositivos necesarios y vuelve a intentarlo.');
                } else {
                     setPermissionError(`Ocurrió un error inesperado al solicitar permisos: ${error.message}`);
                }
            } else {
                setPermissionError('Ocurrió un error desconocido al solicitar permisos.');
            }
        }
    }, []);

    // FIX: The original `handleEndSession` function contained multiple syntax errors that broke the component's structure. It has been rewritten to correctly handle the try...catch block and state updates. The unnecessary 'async' keyword has also been removed. This single fix resolves all reported cascading errors in this file.
    const handleEndSession = useCallback(() => {
        // Limpia la sesión y el progreso del almacenamiento local para un nuevo comienzo
        try {
            localStorage.removeItem('algebra-tutor-messages');
            localStorage.removeItem('algebra-tutor-progress');
        } catch (error) {
            console.error("Error al limpiar la sesión del almacenamiento local:", error);
        }
        setStatus('idle');
    }, []);

    const renderContent = () => {
        switch (status) {
            case 'active':
                return <TutorView onEndSession={handleEndSession} />;
            case 'idle':
            case 'requesting_permissions':
            case 'permissions_denied':
            default:
                return (
                    <WelcomeScreen
                        onStart={handleStartSession}
                        status={status}
                        error={permissionError}
                    />
                );
        }
    };

    return (
        <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            {renderContent()}
        </main>
    );
};

export default App;
