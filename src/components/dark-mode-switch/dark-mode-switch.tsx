import React, { useCallback, useState } from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { FiSun, FiMoon } from 'react-icons/fi';

const DarkModeSwitch: FunctionComponent = (): ReactElement => {
    const [darkMode, setDarkMode] = useState<boolean>(false);

    const toggleDarkMode = useCallback(() => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    }, [darkMode]);

    return (
        <>
            {darkMode === true ? (
                <FiMoon
                    size="28"
                    onClick={toggleDarkMode}
                />
            ) : (
                <FiSun
                    size="28"
                    onClick={toggleDarkMode}
                />
            )}
        </>
    );
};

export { DarkModeSwitch };
