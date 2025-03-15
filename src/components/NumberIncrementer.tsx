import React, { useEffect, useState } from 'react';

const NumberIncrementer: React.FC<{ target: number, incrementSpeed: number }> = ({ target, incrementSpeed }) => {
    const [currentNumber, setCurrentNumber] = useState(0);

    const beautifyNumber = (num: number) => {
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    useEffect(() => {
        if (target === 0) {
            setCurrentNumber(0);
            return;
        }

        let startTime: number;
        let animationFrameId: number;

        let division = (target > 500000) ? 800 : (target > 100000) ? 600 : (target > 50000) ? 400 : (target > 10000) ? 200 : 100;

        const incrementNumber = (timestamp: number) => {
            if (!startTime) startTime = timestamp;

            const progress = timestamp - startTime;
            const progressPercentage = Math.min(progress / (incrementSpeed / division), 1);
            const newNumber = Math.round(progressPercentage * target);

            setCurrentNumber(newNumber);

            if (progressPercentage < 1)
                animationFrameId = requestAnimationFrame(incrementNumber);
        };

        animationFrameId = requestAnimationFrame(incrementNumber);

        return () => cancelAnimationFrame(animationFrameId);
    }, [target, incrementSpeed]);

    return <>{beautifyNumber(currentNumber)}</>;
};

export default NumberIncrementer;
