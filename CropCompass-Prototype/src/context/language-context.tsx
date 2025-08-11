"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import kn from '@/locales/kn.json';

type Language = 'en' | 'hi' | 'kn';

const translations = { en, hi, kn };

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    const t = useMemo(() => (key: string): any => {
        const keys = key.split('.');
        let result: any = translations[language];
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                // Fallback to English if translation is missing
                let fallbackResult: any = translations.en;
                for (const fk of keys) {
                    fallbackResult = fallbackResult?.[fk];
                }
                return fallbackResult || key;
            }
        }
        return result || key;
    }, [language]);
    

    const value = {
        language,
        setLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
