import { CommandGroup, CommandItem } from '@/Components/Command';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { router, usePage } from '@inertiajs/react';
import { Compass, FileText, List, MessageCircle } from 'lucide-react';
import Paragraph from '../atoms/Paragraph';

interface ToolsSectionProps {
    onSelect: () => void;
    onOpenChatbox?: () => void;
}

export default function ToolsSection({ onSelect, onOpenChatbox }: ToolsSectionProps) {
    const { t } = useLaravelReactI18n();
    const { locale } = usePage().props as { locale?: string };

    const chatboxItem = {
        id: 'catalyst-chatbox',
        title: t('catalyst.chatbox.title'),
        description: t('catalyst.chatbox.description'),
        icon: MessageCircle,
        action: 'chatbox' as const,
    };

    const exploreItems = [
        {
            id: 'explore-proposals',
            title: t('globalSearch.explore.proposals'),
            description: t('globalSearch.explore.proposalsDesc'),
            href: generateLocalizedRoute('proposals.index'),
            icon: FileText,
            action: 'navigate' as const,
        },
        {
            id: 'explore-lists',
            title: t('globalSearch.explore.lists'),
            description: t('globalSearch.explore.listsDesc'),
            href: generateLocalizedRoute('lists.index'),
            icon: List,
            action: 'navigate' as const,
        },
    ];

    const allItems = [chatboxItem, ...exploreItems];

    const handleItemSelect = (item: typeof allItems[0]) => {
        if (item.action === 'chatbox') {
            onOpenChatbox?.();
        } else if (item.action === 'navigate' && 'href' in item) {
            onSelect();
            router.visit(item.href);
        }
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
            {allItems.map((item) => (
                <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleItemSelect(item)}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2"
                    data-testid={`global-search-${item.action}-${item.id}`}
                >
                    <item.icon className={`h-4 w-4 shrink-0 ${
                        item.action === 'chatbox' ? 'text-primary font-bold' : 'text-primary'
                    }`} />
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
