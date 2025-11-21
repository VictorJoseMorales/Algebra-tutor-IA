
import React, { useMemo } from 'react';
import { BrainCircuitIcon } from './Icons';

interface FillInTheBlankCardProps {
    question: string;
    answer: string;
    feedback: 'correct' | 'incorrect' | null;
}

const FillInTheBlankCard: React.FC<FillInTheBlankCardProps> = ({ question, feedback }) => {
    const [before, after] = useMemo(() => question.split('[?]'), [question]);

    const feedbackClasses = {
        correct: 'border-green-500 bg-green-900/50',
        incorrect: 'border-red-500 bg-red-900/50',
    };

    return (
        <div className={`bg-gray-700 border-l-4 border-yellow-500 rounded-r-lg p-4 my-2 max-w-xl shadow-lg self-start transition-all duration-300 ${feedback ? feedbackClasses[feedback] : ''}`}>
            <div className="flex items-center space-x-2 mb-3">
                <BrainCircuitIcon className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-yellow-300">¡Tu Turno!</h3>
            </div>
            <div className="font-mono text-lg text-white p-3 bg-gray-800 rounded-md flex items-center justify-center flex-wrap gap-2">
                <span>{before}</span>
                <span className="inline-block w-20 h-8 bg-gray-900 border-2 border-dashed border-gray-500 rounded text-center leading-7">
                    ?
                </span>
                <span>{after}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Di la respuesta en voz alta para rellenar el espacio.</p>
        </div>
    );
};

export default FillInTheBlankCard;
