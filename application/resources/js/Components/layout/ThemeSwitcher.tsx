import { useThemeContext } from '@/Context/ThemeContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Button from '../atoms/Button';
import DarkModeIcon from '../svgs/DarkModeIcon';
import LightModeIcon from '../svgs/LightModeIcon';
import VoltaireModeIcon from '../svgs/VoltaireModeIcon';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useThemeContext();
    const { t } = useLaravelReactI18n();

    const icons: { [key in 'light' | 'dark' | 'voltaire']: React.JSX.Element } = {
        light: <LightModeIcon />,
        dark: <DarkModeIcon />,
        voltaire: <VoltaireModeIcon />,
    };

    return (
        <fieldset
            className="relative flex flex-col items-center gap-2 rounded-sm"
            aria-labelledby="theme-legend"
            data-testid="theme-switcher"
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
                data-testid="theme-options"
            >
                {(['light', 'dark', 'voltaire'] as const).map((mode) => (
                    <Button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        ariaLabel={t('theme.changeMode', { mode })}
                        ariaPressed={theme === mode}
                        className={`bg-background text-5 text-content hover:bg-background-lighter inline-flex flex-1 items-center gap-1 rounded-sm border px-1 ${theme === mode ? 'bg-background-lighter' : ''}`}
                        dataTestId={`theme-button-${mode}`}
                    >
                        <span aria-hidden={true}>{icons[mode]}</span>
                        <span>{t(`theme.${mode}`)}</span>
                    </Button>
                ))}
            </div>
        </fieldset>
    );
}
