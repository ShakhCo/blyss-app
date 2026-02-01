import { useI18nStore, type Language } from '~/stores/i18n-store';
import { Button } from './Button';

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { language, setLanguage } = useI18nStore();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {languages.map((lang) => (
        <Button
          key={lang.code}
          color={language === lang.code ? 'soft-primary' : 'secondary'}
          onClick={() => setLanguage(lang.code)}
          border="full"
          size="sm"
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.label}
        </Button>
      ))}
    </div>
  );
}
