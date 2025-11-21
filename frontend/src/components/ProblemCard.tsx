
import React from 'react';
import type { AlgebraProblem } from '../types';
import { BrainCircuitIcon } from './Icons';

const ProblemCard: React.FC<AlgebraProblem> = ({ topic, problem, difficulty }) => {
    const getDifficultyColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'fácil': return 'bg-green-500 text-green-100';
            case 'medio': return 'bg-yellow-500 text-yellow-100';
            case 'difícil': return 'bg-red-500 text-red-100';
            default: return 'bg-gray-500 text-gray-100';
        }
    };

    return (
        <div className="bg-gray-700 border-l-4 border-purple-500 rounded-r-lg p-4 my-2 max-w-xl shadow-lg self-start">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                    <BrainCircuitIcon className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-purple-300">Problema de Álgebra</h3>
                </div>
                <div className="flex space-x-2">
                     <span className={`px-2 py-1 text-xs font-bold rounded-full ${getDifficultyColor(difficulty)}`}>{difficulty}</span>
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-cyan-600 text-cyan-100">{topic}</span>
                </div>
            </div>
            <p className="text-white text-lg font-mono">{problem}</p>
        </div>
    );
};

export default ProblemCard;
