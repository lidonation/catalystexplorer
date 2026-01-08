import { useLaravelReactI18n } from "laravel-react-i18n";
import { OG_THEMES } from "../../constants/ogTheme";
import Paragraph from "@/Components/atoms/Paragraph";
import BackgroundThemeSwatch from "./BackgroundThemeSwatch";

interface BackgroundThemeGridProps {
    selectedThemeId: string;
    onSelect: (themeId: string) => void;
}

export default function BackgroundThemeGrid(
    {
        selectedThemeId,
        onSelect,
    }: BackgroundThemeGridProps
) {

    const { t } = useLaravelReactI18n();
    const firstRow = OG_THEMES.slice(0, 4);
    const secondRow = OG_THEMES.slice(4, 8);

    return (
        <div className="flex flex-col gap-4">
            <Paragraph size="sm" className="text-content font-bold">
                {t('shareCard.backgroundTheme')}
            </Paragraph>
            <div className="flex flex-col gap-2.5">
                <div className="flex gap-2.5">
                    {firstRow.map((theme) => (
                        <BackgroundThemeSwatch
                            key={theme.id}
                            theme={theme}
                            isSelected={selectedThemeId === theme.id}
                            onSelect={() => onSelect(theme.id)}
                        />
                    ))
                    }
                </div>
                <div className="flex gap-2.5">
                    {secondRow.map((theme) => (
                        <BackgroundThemeSwatch
                            key={theme.id}
                            theme={theme}
                            isSelected={selectedThemeId === theme.id}
                            onSelect={() => onSelect(theme.id)}
                        />
                    ))
                    }
                </div>
            </div>

        </div>
    )
}