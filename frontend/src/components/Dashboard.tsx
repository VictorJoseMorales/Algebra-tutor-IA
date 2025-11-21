
import React, { useState, useEffect } from 'react';
import type { ProgressData, TopicProgress } from '../types';
import { ClockIcon, TargetIcon, BookOpenIcon } from './Icons';

interface DashboardProps {
    progress: ProgressData;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string;}> = ({ icon, label, value }) => (
    <div className="bg-gray-800 p-3 rounded-lg flex items-center space-x-3">
        {icon}
        <div>
            <p className="text-gray-400 text-xs font-medium">{label}</p>
            <p className="text-white text-lg font-bold">{value}</p>
        </div>
    </div>
);

const TopicProgressBar: React.FC<{ topic: string, data: TopicProgress }> = ({ topic, data }) => {
    const percentage = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
    
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-300 capitalize">{topic}</p>
                <p className="text-xs font-semibold text-cyan-400">{percentage}% Dominio</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                    className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ progress }) => {
    const [elapsedTime, setElapsedTime] = useState('00:00');

    useEffect(() => {
        if (!progress?.startTime) return;

        const timer = setInterval(() => {
            const seconds = Math.floor((Date.now() - progress.startTime) / 1000);
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            setElapsedTime(`${m}:${s}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [progress?.startTime]);

    const { totalAttempted, totalCorrect } = Object.values(progress.topics).reduce(
        (acc, topic) => {
            acc.totalAttempted += topic.attempted;
            acc.totalCorrect += topic.correct;
            return acc;
        },
        { totalAttempted: 0, totalCorrect: 0 }
    );
    
    const accuracy = totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(0) : '0';

    return (
        <div className="bg-gray-900 rounded-lg p-4 h-full flex flex-col">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 text-center">Progreso en Vivo</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard icon={<ClockIcon className="w-6 h-6 text-blue-400"/>} label="Tiempo" value={elapsedTime} />
                <StatCard icon={<TargetIcon className="w-6 h-6 text-green-400"/>} label="Precisión" value={`${accuracy}%`} />
            </div>

            <div className="flex-grow bg-gray-800 p-4 rounded-lg overflow-y-auto">
                 <div className="flex items-center gap-2 mb-3">
                    <BookOpenIcon className="w-5 h-5 text-purple-400"/>
                    <h3 className="text-lg font-semibold text-purple-400">Dominio de Temas</h3>
                </div>
                {Object.keys(progress.topics).length > 0 ? (
                    <div className="space-y-4">
                       {Object.entries(progress.topics).map(([topic, data]) => (
                           <TopicProgressBar key={topic} topic={topic} data={data} />
                       ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center text-sm mt-4">¡Comienza a resolver problemas para ver tu progreso aquí!</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
