
import React from 'react';
import { PlayIcon, PauseIcon } from './Icons';

interface PlaybackControlsProps {
    isPaused: boolean;
    onTogglePause: () => void;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({ isPaused, onTogglePause }) => {
    return (
        <button
            onClick={onTogglePause}
            className="p-1 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors"
            aria-label={isPaused ? "Reanudar" : "Pausar"}
        >
            {isPaused ? (
                <PlayIcon className="w-4 h-4" />
            ) : (
                <PauseIcon className="w-4 h-4" />
            )}
        </button>
    );
};

export default PlaybackControls;
