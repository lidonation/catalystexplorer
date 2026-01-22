import { CommandGroup, CommandItem, CommandSeparator } from '@/Components/Command';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { router, usePage } from '@inertiajs/react';
import { Clock, FileText, List } from 'lucide-react';
import Paragraph from '../atoms/Paragraph';

interface RecentlyVisitedSectionProps {
    recentProposals: App.DataTransferObjects.RecentlyVisitedProposalData[];
    recentLists: App.DataTransferObjects.RecentlyVisitedListData[];
    onSelect: () => void;
}

export default function RecentlyVisitedSection({ recentProposals, recentLists, onSelect }: RecentlyVisitedSectionProps) {

    const { t } = useLaravelReactI18n();
    const { locale } = usePage().props as { locale?: string };
    const resolvedLocale = locale || 'en';

    const handleProposalClick = (proposal: App.DataTransferObjects.RecentlyVisitedProposalData) => {
        onSelect();
        const proposalRoute = generateLocalizedRoute(
            'proposals.proposal.details',
            { slug: proposal.slug },
        );
        router.visit(proposalRoute);
    }

    const handleListClick = (list: App.DataTransferObjects.RecentlyVisitedListData) => {
        onSelect();
        const listRoute = generateLocalizedRoute(
            'lists.view',
            { bookmarkCollection: list.id },
        );
        router.visit(listRoute);
    }

    const formatTimeAgo = (timestamp: number): string => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) {
            return t('globalSearch.timeAgo.minutes', { count: minutes });
        } else if (hours < 24) {
            return t('globalSearch.timeAgo.hours', { count: hours });
        } else {
            return t('globalSearch.timeAgo.days', { count: days });
        }
    };

    return (
        <>
            {recentProposals.length > 0 && (
                <CommandGroup
                    heading={
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-primary" />
                            <Paragraph size='sm' className='text-primary font-bold'>{t('globalSearch.sections.recentProposals')}</Paragraph>
                        </div>
                    }
                        className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm"
                    >
                    {recentProposals.map((proposal) => (
                        <CommandItem
                            key={`proposal-${proposal.id}`}
                            value={`proposal-${proposal.id}`}
                            onSelect={() => handleProposalClick(proposal)}
                            className="flex cursor-pointer items-center gap-3 px-3 py-2"
                            data-testid={`global-search-recent-proposal-${proposal.id}`}
                        >
                            <FileText className="text-content h-4 w-4 shrink-0" />
                            <div className="flex min-w-0 flex-1 flex-col">
                                <Paragraph className="text-content truncate text-sm font-medium">
                                    {proposal.title}
                                </Paragraph>
                                <div className="flex items-center gap-2">
                                    {proposal.fund_label && (
                                        <Paragraph size='xs' className='text-content'>{proposal.fund_label}</Paragraph>
                                    )}
                                    <Paragraph size='xs' className='text-content'>{formatTimeAgo(proposal.visited_at)}</Paragraph>
                                </div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}

            {recentProposals.length > 0 && recentLists.length > 0 && (
                <CommandSeparator />
            )}

            {recentLists.length > 0 && (
                <CommandGroup
                    heading={
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-primary" />
                            <Paragraph size='sm' className='text-primary font-bold'>{t('globalSearch.sections.recentLists')}</Paragraph>
                        </div>
                    }
                        className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm"
                    >
                    {recentLists.map((list) => (
                        <CommandItem
                            key={`list-${list.id}`}
                            value={`list-${list.id}`}
                            onSelect={() => handleListClick(list)}
                            className="flex cursor-pointer items-center gap-3 px-3 py-2"
                            data-testid={`global-search-recent-list-${list.id}`}
                        >
                            <List className="text-content h-4 w-4 shrink-0" />
                            <div className="flex min-w-0 flex-1 flex-col">
                                <Paragraph className="text-content truncate text-sm font-medium">
                                    {list.title}
                                </Paragraph>
                                <div className="flex items-center gap-2">
                                    {list.visit_count !== undefined && (
                                        <Paragraph size='xs' className='text-content'>
                                            {t('globalSearch.itemsCount', { count: list.visit_count })}
                                        </Paragraph>
                                    )}
                                    <Paragraph size='xs' className='text-content'>{formatTimeAgo(list.visited_at)}</Paragraph>
                                </div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}

        </>
    )
}