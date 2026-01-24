import { useEffect, useRef } from 'react';

const useIdleTimer = (onIdle, timeout = 900000) => { // Default: 15 minutes
    const timerRef = useRef(null);

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(onIdle, timeout);
        };

        // Events to watch for activity
        const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Start timer initially
        resetTimer();

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [onIdle, timeout]);
};

export default useIdleTimer;
