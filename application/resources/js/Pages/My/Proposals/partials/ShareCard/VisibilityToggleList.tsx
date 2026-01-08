import Title from "@/Components/atoms/Title";
import { useLaravelReactI18n } from "laravel-react-i18n";
import VisibilityToggleItem from "./VisibilityToggleItem";

interface VisibilityToggleListProps {
    visibleElements: App.ShareCard.VisibleElement[];
    onToggle: (element: App.ShareCard.VisibleElement, checked: boolean) => void;
}

const TOGGLE_ITEMS: {
    id: App.ShareCard.VisibleElement;
    labelKey: string;
}[] = [
        { id: 'myVote', labelKey: 'shareCard.visibility.myVote' },
        { id: 'logo', labelKey: 'shareCard.visibility.logo' },
        { id: 'totalVotes', labelKey: 'shareCard.visibility.totalVotes' },
        { id: 'campaignTitle', labelKey: 'shareCard.visibility.campaignTitle' },
        { id: 'openSourceBadge', labelKey: 'shareCard.visibility.openSourceBadge' },
        

    ]

export default function VisibilityToggleList(
    { visibleElements,
        onToggle }: VisibilityToggleListProps
) {
    const { t } = useLaravelReactI18n();

    return (
        <div className="flex flex-col gap-5">
            <Title level="3" className="text-sm font-semibold text-light-content">{t('shareCard.visibleElements')}</Title>
            <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                {TOGGLE_ITEMS.map((item) => (
                    <VisibilityToggleItem
                        key={item.id}
                        id={`visibility-${item.id}`}
                        label={t(item.labelKey)}
                        checked={visibleElements.includes(item.id)}
                        onChange={(checked) => onToggle(item.id, checked)}
                    />
                ))
                }
            </div>
        </div>
    )

}

