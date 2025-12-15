import React from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { PaginatedData } from '@/types/paginated-data';
import SingleLinkCard from '@/Components/atoms/SingleLinkCard';
import Paginator from '@/Components/Paginator';

interface LinksListProps {
    links: PaginatedData<App.DataTransferObjects.LinkData[]>;
}

const LinksList: React.FC<LinksListProps> = ({ links }) => {
    const { t } = useLaravelReactI18n();

    if (!links.data || links.data.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                    </svg>
                </div>
                <h3 className="text-content text-lg font-medium mb-2">
                    {t('links.noLinks')}
                </h3>
                <p className="text-gray-persist text-sm max-w-md mx-auto">
                    {t('links.noLinksDescription')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Links Grid */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {links.data.map((link) => (
                    <SingleLinkCard
                        key={link.id}
                        link={link}
                        className="h-full"
                    />
                ))}
            </div>

            {/* Pagination */}
            {links.last_page > 1 && (
                <div className="mb-8 w-full">
                    <Paginator pagination={links} />
                </div>
            )}
        </div>
    );
};

export default LinksList;
