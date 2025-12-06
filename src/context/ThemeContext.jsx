import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
    isDark: false,
    setIsDark: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') || 'light';
        setIsDark(savedTheme === 'dark');
    }, []);

    // Apply theme changes to document
    useEffect(() => {
        if (mounted) {
            const html = document.documentElement;
            if (isDark) {
                html.classList.add('dark');
                html.classList.remove('light');
                localStorage.setItem('theme', 'dark');
            } else {
                html.classList.remove('dark');
                html.classList.add('light');
                localStorage.setItem('theme', 'light');
            }
        }
    }, [isDark, mounted]);

    return (
        <ThemeContext.Provider value={{ isDark, setIsDark }}>
            {children}
        </ThemeContext.Provider>
    );
}
