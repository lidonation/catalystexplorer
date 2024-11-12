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
            className="flex flex-col items-center gap-2 rounded relative"
            aria-labelledby="theme-legend"
        >
            <legend id="theme-legend"
                    className="text-content text-xs py-2 px-1.5 ml-2.5 sr-only">
                {t('theme.theme')}
            </legend>
            <div
                className="flex justify-between w-full gap-x-2.5"
                role="group"
                aria-label={t('theme.options')}
            >
                {(['light', 'dark', 'voltaire'] as const).map((mode) => (
                    <Button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        ariaLabel={t('theme.changeMode', { mode })}
                        aria-pressed={theme === mode}
                        className={`inline-flex items-center flex-1 gap-1 rounded border bg-background px-1 text-xs text-content hover:bg-background-lighter ${theme === mode ? 'bg-background-lighter' : ''}`}
                    >
                        <span aria-hidden={true}>
                            {icons[mode]}
                        </span>
                        <span>
                            {t(`theme.${mode}`)}
                        </span>
                    </Button>
                ))}
            </div>
        </fieldset>
    );
}
