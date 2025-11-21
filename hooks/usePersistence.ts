import { useState, useEffect } from 'react';
import { Message, ProgressData } from '../types';

const STORAGE_KEYS = {
    MESSAGES: 'algebra_tutor_messages',
    PROGRESS: 'algebra_tutor_progress',
};

export const usePersistence = (
    initialMessages: Message[],
    initialProgress: ProgressData
) => {
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
        return saved ? JSON.parse(saved) : initialMessages;
    });

    const [progress, setProgress] = useState<ProgressData>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.PROGRESS);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...parsed,
                topics: new Set(parsed.topics), // Rehydrate Set
            };
        }
        return initialProgress;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        const serializedProgress = {
            ...progress,
            topics: Array.from(progress.topics), // Serialize Set to Array
        };
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(serializedProgress));
    }, [progress]);

    const clearSession = () => {
        localStorage.removeItem(STORAGE_KEYS.MESSAGES);
        localStorage.removeItem(STORAGE_KEYS.PROGRESS);
        setMessages([]);
        setProgress(initialProgress);
    };

    return {
        messages,
        setMessages,
        progress,
        setProgress,
        clearSession
    };
};
