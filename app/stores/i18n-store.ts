import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '~/lib/i18n/translations';

export type Language = 'uz' | 'ru';

interface I18nState {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'uz',
      setLanguage: (language) => set({ language }),
      t: (key, params) => {
        const { language } = get();
        const translation = translations[language][key as keyof typeof translations.uz];

        if (!translation) {
          console.warn(`Translation key "${key}" not found for language "${language}"`);
          return key;
        }

        // Replace params in translation string
        if (params) {
          return Object.keys(params).reduce(
            (str, paramKey) =>
              str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(params[paramKey])),
            translation
          );
        }

        return translation;
      },
    }),
    {
      name: 'blyss-app-language-storage',
    }
  )
);
