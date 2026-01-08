import Button from "@/Components/atoms/Button";

interface BackgroundThemeSwatchProps {
    theme: {
        id: string;
        cssGradient: string;
        name: string;
    };
    isSelected: boolean;
    onSelect: () => void
}

export default function BackgroundThemeSwatch(
    {
        theme,
        isSelected,
        onSelect
    }: BackgroundThemeSwatchProps
) {

    return (
        <button
            type="button"
            onClick={onSelect}
            className={
                `h-[53px] flex-1 rounded-xl transition-all duration-150 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-white' : ''
                }`
            }
            style={{ background: theme.cssGradient }}
            aria-label={`Select ${theme.name} theme`}
            aria-pressed={isSelected} />
    );


}