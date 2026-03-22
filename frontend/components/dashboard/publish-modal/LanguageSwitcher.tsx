import React from "react";

interface LanguageSwitcherProps {
    activeLang: 'en' | 'es';
    setActiveLang: (lang: 'en' | 'es') => void;
}

export function LanguageSwitcher({ activeLang, setActiveLang }: LanguageSwitcherProps) {
    return (
        <div className="flex justify-center">
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <button
                    onClick={() => setActiveLang('en')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLang === 'en'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                        }`}
                >
                    English
                </button>
                <button
                    onClick={() => setActiveLang('es')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLang === 'es'
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                        }`}
                >
                    Español
                </button>
            </div>
        </div>
    );
}
