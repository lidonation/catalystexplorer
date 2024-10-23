import { useThemeContext } from '@/Context/ThemeContext';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useThemeContext();

    return (
        <div className="border-background flex w-60 flex-col items-center gap-2 rounded border-2 pb-2">
            <p className="text-content-primary underline">Change theme color</p>
            <div className="flex space-x-2">
                {['light', 'dark', 'voltaire'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setTheme(mode)}
                        className={`bg-background-primary hover:bg-background-secondary text-content-primary rounded border px-2 ${theme === mode ? 'border-background-primary' : ''}`}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
}
