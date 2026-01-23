import { CommandGroup, CommandItem } from '@/Components/Command';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { router, usePage } from '@inertiajs/react';
import { Bookmark, FileText, FolderOpen, List } from 'lucide-react';
import Paragraph from '../atoms/Paragraph';
import { motion, useReducedMotion } from 'framer-motion';

interface PlacesSectionProps {
    onSelect: () => void;
}

export default function PlacesSection({ onSelect }: PlacesSectionProps) {
    const { t } = useLaravelReactI18n();

    const prefersReducedMotion = useReducedMotion();

    const places = [
        {
            id: 'manage-proposals',
            title: t('globalSearch.places.manageProposals'),
            description: t('globalSearch.places.manageProposalsDesc'),
            href: generateLocalizedRoute('my.proposals.index'),
            icon: FileText,
            requiresAuth: true,
        },
        {
            id: 'manage-lists',
            title: t('globalSearch.places.manageLists'),
            description: t('globalSearch.places.manageListsDesc'),
            href: generateLocalizedRoute('my.lists.index'),
            icon: List,
            requiresAuth: true,
        },
        {
            id: 'view-proposals',
            title: t('globalSearch.places.viewProposals'),
            description: t('globalSearch.places.viewProposalsDesc'),
            href: generateLocalizedRoute('proposals.index'),
            icon: FolderOpen,
            requiresAuth: false,
        },
        {
            id: 'view-bookmarks',
            title: t('globalSearch.places.viewBookmarks'),
            description: t('globalSearch.places.viewBookmarksDesc'),
            href: generateLocalizedRoute('lists.index'),
            icon: Bookmark,
            requiresAuth: false,
        },
    ];

    const handleNavigate = (href: string) => {
        onSelect();
        router.visit(href);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2, delay: 0.05 }}
        >
            <CommandGroup
                heading={t('globalSearch.sections.places')}
                className="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:text-sm"
            >
                {places.map((place) => (
                    <CommandItem
                        key={place.id}
                        value={place.id}
                        onSelect={() => handleNavigate(place.href)}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2"
                        data-testid={`global-search-place-${place.id}`}
                    >
                        <place.icon className="text-content h-4 w-4 shrink-0" />
                        <div className="flex flex-col">
                            <Paragraph className="text-content text-sm font-medium">
                                {place.title}
                            </Paragraph>
                            {place.description && (
                                <Paragraph size='xs' className="text-content">
                                    {place.description}
                                </Paragraph>
                            )}
                        </div>
                    </CommandItem>
                ))}
            </CommandGroup>
        </motion.div>
    );

}