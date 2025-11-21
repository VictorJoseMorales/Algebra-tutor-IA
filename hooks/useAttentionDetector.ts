
import { useState, useEffect, RefObject } from 'react';
import type { AttentionState } from '../types';

export function useAttentionDetector(videoRef: RefObject<HTMLVideoElement>): AttentionState {
    const [attentionState, setAttentionState] = useState<AttentionState>('focused');

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (videoRef.current && !videoRef.current.paused) {
                const randomValue = Math.random();
                if (randomValue < 0.7) {
                    setAttentionState('focused');
                } else if (randomValue < 0.9) {
                    setAttentionState('distracted');
                } else {
                    setAttentionState('away');
                }
            }
        }, 5000); // Check attention every 5 seconds

        return () => clearInterval(intervalId);
    }, [videoRef]);

    return attentionState;
}
