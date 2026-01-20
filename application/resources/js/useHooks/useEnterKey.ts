import { useEffect, RefObject } from 'react';

interface UseEnterKeyOptions {
    enabled?: boolean;
    targetRef?: RefObject<HTMLElement | null>;
}

export default function useEnterKey(
    onEnter: () => void,
    options: UseEnterKeyOptions = {},
) {
    const { enabled = true, targetRef } = options;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Enter') return;

            if (targetRef?.current && event.target instanceof Node) {
                if (!targetRef.current.contains(event.target)) return;
            }

            onEnter();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [enabled, onEnter, targetRef]);
}
