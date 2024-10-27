import { useThemeContext } from '@/Context/ThemeContext';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useThemeContext();

    const icons: { [key in 'light' | 'dark' | 'voltaire']: JSX.Element } = {
        light: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
                aria-hidden="true"
                focusable="false"
            >
                <title>Light Mode Icon</title>
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
            </svg>
        ),
        dark: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
            >
                <title>Dark Mode Icon</title>
                <path d="M21 12.79A9 9 0 0112 21a9.11 9.11 0 01-4.34-1.1 1 1 0 01.3-1.84A7 7 0 1013 5.06a1 1 0 01-1.34-1.31A9 9 0 0121 12.79z" />
            </svg>
        ),
        voltaire: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
            >
                <title>Voltaire Mode Icon</title>
                <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2zm0 4a6 6 0 100 12 6 6 0 000-12z" />
            </svg>
        ),
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
                aria-label="Theme Options"
            >
                {(['light', 'dark', 'voltaire'] as const).map((mode) => (
                    <button
                        type="button"
                        key={mode}
                        onClick={() => setTheme(mode)}
                        aria-pressed={theme === mode}
                        className={`flex items-center space-x-1 rounded border bg-background-primary px-1 text-content-primary hover:bg-background-secondary ${
                            theme === mode ? 'border-background-primary' : ''
                        }`}
                    >
                        {icons[mode]}
                        <span>
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </span>
                    </button>
                ))}
            </div>
        </fieldset>
    );
}
