"use client";

import { useLanguage } from '@/context/language-context';

export function useTranslation(): { t: (key: string) => any; language: 'en' | 'hi' | 'kn' } {
    const { t, language, setLanguage } = useLanguage();
    return { t, language };
}
