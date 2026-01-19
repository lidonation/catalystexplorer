import { CommandGroup, CommandItem } from '@/Components/Command';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { router, usePage } from '@inertiajs/react';
import { Compass, FileText, List } from 'lucide-react';
import Paragraph from '../atoms/Paragraph';

interface NullStateSectionProps {
    onSelect: () => void;
}

export default function NullStateSection({ onSelect }: NullStateSectionProps) {
    const { t } = useLaravelReactI18n();
    const { locale } = usePage().props as { locale?: string };

    const exploreItems = [
        {
            id: 'explore-proposals',
            title: t('globalSearch.explore.proposals'),
            description: t('globalSearch.explore.proposalsDesc'),
            href: generateLocalizedRoute('proposals.index'),
            icon: FileText,
        },
        {
            id: 'explore-lists',
            title: t('globalSearch.explore.lists'),
            description: t('globalSearch.explore.listsDesc'),
            href: generateLocalizedRoute('lists.index'),
            icon: List,
        },
    ];

    const handleNavigate = (href: string) => {
        onSelect();
        router.visit(href);
    };

    return (
        <CommandGroup
            heading={
                <div className="flex items-center gap-2">
                    <Compass className="h-3 w-3" />
                    <Paragraph className='text-sm text-primary'>{t('globalSearch.sections.explore')}</Paragraph>
                </div>
            }
            className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm"
        >
            <div className="px-3 py-2">
                <Paragraph className="text-content text-xs">{t('globalSearch.noRecentItems')}</Paragraph>
            </div>
            {exploreItems.map((item) => (
                <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleNavigate(item.href)}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                    data-testid={`global-search-explore-${item.id}`}
                >
                    <item.icon className="text-primary h-4 w-4 shrink-0" />
                    <div className="flex flex-col">
                        <Paragraph className="text-content text-sm font-medium">
                            {item.title}
                        </Paragraph>
                        {item.description && (
                            <Paragraph className="text-content-light text-xs">
                                {item.description}
                            </Paragraph>
                        )}
                    </div>
                </CommandItem>
            ))}
        </CommandGroup>
    );
}