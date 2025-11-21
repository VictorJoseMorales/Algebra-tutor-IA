
import React from 'react';
import { BrainCircuitIcon } from './Icons';

interface VisualSolutionCardProps {
    steps: string[];
}

const VisualSolutionCard: React.FC<VisualSolutionCardProps> = ({ steps }) => {
    return (
        <div className="bg-gray-700 border-l-4 border-teal-500 rounded-r-lg p-4 my-2 max-w-xl shadow-lg self-start">
            <div className="flex items-center space-x-2 mb-3">
                <BrainCircuitIcon className="w-6 h-6 text-teal-400" />
                <h3 className="text-lg font-semibold text-teal-300">Solución Visual</h3>
            </div>
            <div className="space-y-2 font-mono text-white">
                {steps.map((step, index) => (
                    <p key={index} className="p-2 bg-gray-800 rounded">{step}</p>
                ))}
            </div>
        </div>
    );
};

export default VisualSolutionCard;
