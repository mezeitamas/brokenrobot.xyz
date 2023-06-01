import React, { useCallback, useEffect, useState } from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { FiSun, FiMoon } from 'react-icons/fi';

const DarkModeSwitch: FunctionComponent = (): ReactElement => {
    const [darkMode, setDarkMode] = useState<boolean>(false);

    const changeColorScheme = useCallback((darkMode: boolean) => {
        if (darkMode === true) {
            window.localStorage.setItem('darkModeColorScheme', 'dark');
            document.documentElement.classList.add('dark');
        } else {
            window.localStorage.removeItem('darkModeColorScheme');
            document.documentElement.classList.remove('dark');
        }

        setDarkMode(darkMode);
    }, []);

    const toggleDarkMode = useCallback(() => {
        changeColorScheme(!darkMode);
    }, [darkMode, changeColorScheme]);

    useEffect(() => {
        const savedDarkModeColorScheme = window.localStorage.getItem('darkModeColorScheme');
        const darkModeColorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        changeColorScheme(savedDarkModeColorScheme === 'dark' ? true : darkModeColorSchemeMediaQuery.matches);

        const darkModeColorSchemeChangeHandler = (event: MediaQueryListEvent) => {
            changeColorScheme(event.matches);
        };

        darkModeColorSchemeMediaQuery.addEventListener('change', darkModeColorSchemeChangeHandler);

        return () => {
            darkModeColorSchemeMediaQuery.removeEventListener('change', darkModeColorSchemeChangeHandler);
        };
    }, [changeColorScheme]);

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
