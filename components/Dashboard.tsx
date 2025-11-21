import React, { useState, useEffect } from 'react';
import type { ProgressData } from '../types';
import { ClockIcon, TargetIcon, TrophyIcon } from './Icons';

interface DashboardProps {
    progress: ProgressData;
    onClose: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string;}> = ({ icon, label, value, color }) => (
    <div className="bg-gray-800 p-4 rounded-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-white text-xl font-bold">{value}</p>
        </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ progress, onClose }) => {
    const [elapsedTime, setElapsedTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const seconds = Math.floor((Date.now() - progress.startTime) / 1000);
            const m = Math.floor(seconds / 60).toString().padStart(2, '0');
            const s = (seconds % 60).toString().padStart(2, '0');
            setElapsedTime(`${m}:${s}`);
        }, 1000);
        return () => clearInterval(timer);
    }, [progress.startTime]);

    const accuracy = progress.attempted > 0 ? ((progress.correct / progress.attempted) * 100).toFixed(0) : '0';
    
    const getTrophyColor = () => {
        const acc = parseInt(accuracy);
        if (acc >= 90) return 'text-yellow-400';
        if (acc >= 70) return 'text-gray-300';
        return 'text-yellow-800';
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-900 border border-cyan-500 rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-white" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-cyan-400">Panel de Progreso</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <StatCard icon={<ClockIcon className="w-6 h-6"/>} label="Tiempo de Estudio" value={elapsedTime} color="bg-blue-500"/>
                    <StatCard icon={<TargetIcon className="w-6 h-6"/>} label="Precisión" value={`${accuracy}%`} color="bg-green-500"/>
                </div>

                 <div className="bg-gray-800 p-6 rounded-lg mb-6 flex flex-col items-center">
                    <TrophyIcon className={`w-24 h-24 mb-4 ${getTrophyColor()}`}/>
                    <p className="text-2xl font-bold">{progress.correct} / {progress.attempted}</p>
                    <p className="text-gray-400">Problemas Resueltos Correctamente</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-purple-400">Temas Cubiertos</h3>
                    {progress.topics.size > 0 ? (
                        <div className="flex flex-wrap gap-2">
                           {[...progress.topics].map(topic => (
                               <span key={topic} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">{topic}</span>
                           ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Aún no se han cubierto temas.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
