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
            className="relative flex flex-col items-center gap-2 rounded-sm"
            aria-labelledby="theme-legend"
        >
            <legend
                id="theme-legend"
                className="text-content text-5 sr-only ml-2.5 px-1.5 py-2"
            >
                {t('theme.theme')}
            </legend>
            <div
                className="flex w-full justify-between gap-x-2.5"
                role="group"
                aria-label={t('theme.options')}
            >
                {(['light', 'dark', 'voltaire'] as const).map((mode) => (
                    <Button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        ariaLabel={t('theme.changeMode', { mode })}
                        aria-pressed={theme === mode}
                        className={`bg-background text-5 text-content hover:bg-background-lighter inline-flex flex-1 items-center gap-1 rounded-sm border px-1 ${theme === mode ? 'bg-background-lighter' : ''}`}
                    >
                        <span aria-hidden={true}>{icons[mode]}</span>
                        <span>{t(`theme.${mode}`)}</span>
                    </Button>
                ))}
            </div>
        </fieldset>
    );
}
