import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const AppSettingsContext = createContext(null);

function initialTheme() {
    const saved = localStorage.getItem('np_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initialLang() {
    const saved = localStorage.getItem('np_lang');
    if (saved === 'tr' || saved === 'en') return saved;
    return (navigator.language || 'en').toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

export function AppSettingsProvider({ children }) {
    const [theme, setTheme] = useState(initialTheme);
    const [lang, setLang] = useState(initialLang);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.setAttribute('data-bs-theme', theme); // Bootstrap 5.3 dark components
        localStorage.setItem('np_theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('np_lang', lang);
    }, [lang]);

    const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
    const toggleLang = useCallback(() => setLang((l) => (l === 'tr' ? 'en' : 'tr')), []);

    const t = useCallback(
        (key) => (translations[lang] && translations[lang][key]) || translations.en[key] || key,
        [lang]
    );

    return (
        <AppSettingsContext.Provider value={{ theme, toggleTheme, lang, setLang, toggleLang, t }}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(AppSettingsContext);
}
