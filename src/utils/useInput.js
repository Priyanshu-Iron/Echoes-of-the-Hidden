import { useEffect, useState } from 'react';

export const useInput = () => {
    const [keys, setKeys] = useState({});

    useEffect(() => {
        const handleKeyDown = (e) => {
            setKeys((prev) => ({ ...prev, [e.code]: true }));
        };

        const handleKeyUp = (e) => {
            setKeys((prev) => ({ ...prev, [e.code]: false }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return keys;
};
