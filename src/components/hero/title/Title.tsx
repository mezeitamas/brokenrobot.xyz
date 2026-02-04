import { useEffect, useState } from 'react';

import { SITE_METADATA } from '../../../consts';

const Title = () => {
    const title = SITE_METADATA.TITLE;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    const [decodedTitle, setDecodedTitle] = useState('');

    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDecodedTitle(
                title
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) {
                            return char;
                        }
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('')
            );

            if (iteration >= title.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3;
        }, 40);

        return () => clearInterval(interval);
    }, []);

    return <h1 className="text-4xl font-bold sm:text-7xl">{decodedTitle || title}</h1>;
};

export { Title };
