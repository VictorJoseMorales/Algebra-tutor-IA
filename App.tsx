
import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TutorView from './components/TutorView';

export type AppStatus = 'idle' | 'requesting_permissions' | 'permissions_denied' | 'active';

const App: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>('idle');

    const handleStartSession = useCallback(async () => {
        setStatus('requesting_permissions');
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            setStatus('active');
        } catch (error) {
            console.error("Permissions denied:", error);
            setStatus('permissions_denied');
        }
    }, []);

    const handleEndSession = useCallback(() => {
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
                    />
                );
        }
    };

    return (
        <main className="min-h-screen bg-cyber-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

            <div className="relative z-10 w-full max-w-7xl flex flex-col items-center">
                {renderContent()}
            </div>
        </main>
    );
};

export default App;
