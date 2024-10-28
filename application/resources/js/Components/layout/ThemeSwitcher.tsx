import { useThemeContext } from '@/Context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Button from '../atoms/Button';
import DarkModeIcon from '../svgs/DarkModeIcon';
import LightModeIcon from '../svgs/LightModeIcon';
import VoltaireModeIcon from '../svgs/VoltaireModeIcon';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useThemeContext();
    const { t } = useTranslation();

    const icons: { [key in 'light' | 'dark' | 'voltaire']: JSX.Element } = {
        light: <LightModeIcon />,
        dark: <DarkModeIcon />,
        voltaire: <VoltaireModeIcon />,
    };

    return (
        <fieldset
            className="border-background flex flex-col items-center gap-2 rounded border pb-2"
            aria-labelledby="theme-legend"
        >
            <legend id="theme-legend" className="text-content-primary">
                {t('theme.changeColor')}
            </legend>
            <div
                className="flex space-x-2"
                role="group"
                aria-label={t('theme.options')}
            >
                {(['light', 'dark', 'voltaire'] as const).map((mode) => (
                    <Button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        ariaLabel={t('theme.changeMode', { mode })}
                        aria-pressed={theme === mode}
                        className={`inline-flex items-center gap-1 rounded border bg-background-primary px-1 text-sm text-content-primary hover:bg-background-secondary ${theme === mode ? 'bg-background-secondary' : ''}`}
                    >
                        {icons[mode]}
                        <span>{t(`theme.${mode}`)}</span>
                    </Button>
                ))}
            </div>
        </fieldset>
    );
}
