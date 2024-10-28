import { useThemeContext } from '@/Context/ThemeContext';
import Button from '../atoms/Button';
import DarkModeIcon from '../svgs/DarkModeIcon';
import LightModeIcon from '../svgs/LightModeIcon';
import VoltaireModeIcon from '../svgs/VoltaireModeIcon';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useThemeContext();

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
                Change Theme Color
            </legend>
            <div
                className="flex space-x-2"
                role="group"
                aria-label="Theme options"
            >
                {(['light', 'dark', 'voltaire'] as const).map((mode) => (
                    <Button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        ariaLabel={`Change theme to ${mode} mode`}
                        aria-pressed={theme === mode}
                        className={`inline-flex items-center gap-1 rounded border bg-background-primary px-1 text-sm text-content-primary hover:bg-background-secondary ${theme === mode ? 'bg-background-secondary' : ''}`}
                    >
                        {icons[mode]}
                        <span>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </span>
                    </Button>
                ))}
            </div>
        </fieldset>
    );
}
