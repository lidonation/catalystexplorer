import React from 'react';
import { useFilterContext } from '@/Context/FiltersContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Selector from '@/Components/atoms/Selector';
import { ParamsEnum } from '@/enums/proposal-search-params';

const LinksFilters: React.FC = () => {
    const { t } = useLaravelReactI18n();
    const { setFilters, getFilter } = useFilterContext();

    const modelTypeOptions = [
        { label: t('links.filters.allModels'), value: '' },
        { label: t('links.filters.proposals'), value: 'proposal' },
        { label: t('links.filters.services'), value: 'service' },
    ];

    const linkTypeOptions = [
        { label: t('links.filters.allTypes'), value: '' },
        { label: t('links.filters.website'), value: 'website' },
        { label: t('links.filters.repository'), value: 'repository' },
        { label: t('links.filters.github'), value: 'github' },
        { label: t('links.filters.documentation'), value: 'documentation' },
        { label: t('links.filters.youtube'), value: 'youtube' },
        { label: t('links.filters.twitter'), value: 'twitter' },
        { label: t('links.filters.linkedin'), value: 'linkedin' },
        { label: t('links.filters.facebook'), value: 'facebook' },
        { label: t('links.filters.instagram'), value: 'instagram' },
        { label: t('links.filters.telegram'), value: 'telegram' },
        { label: t('links.filters.discord'), value: 'discord' },
    ];

    const statusOptions = [
        { label: t('links.filters.allStatuses'), value: '' },
        { label: t('links.filters.published'), value: 'published' },
        { label: t('links.filters.draft'), value: 'draft' },
        { label: t('links.filters.archived'), value: 'archived' },
    ];

    const handleModelTypeChange = (value: string) => {
        setFilters({
            label: t('links.filters.modelType'),
            value: value ? [value] : [],
            param: 'model_types',
        });
    };

    const handleLinkTypeChange = (value: string) => {
        setFilters({
            label: t('links.filters.linkType'),
            value: value ? [value] : [],
            param: 'link_types',
        });
    };

    const handleStatusChange = (value: string) => {
        setFilters({
            label: t('links.filters.status'),
            value: value ? [value] : [],
            param: 'statuses',
        });
    };

    return (
        <div className="w-full max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3">
                {/* Model Type Filter */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-content">
                        {t('links.filters.modelType')}
                    </label>
                    <Selector
                        options={modelTypeOptions}
                        selectedItems={getFilter('model_types')?.[0] || ''}
                        setSelectedItems={handleModelTypeChange}
                        placeholder={t('links.filters.selectModelType')}
                    />
                </div>

                {/* Link Type Filter */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-content">
                        {t('links.filters.linkType')}
                    </label>
                    <Selector
                        options={linkTypeOptions}
                        selectedItems={getFilter('link_types')?.[0] || ''}
                        setSelectedItems={handleLinkTypeChange}
                        placeholder={t('links.filters.selectLinkType')}
                    />
                </div>

                {/* Status Filter */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-content">
                        {t('links.filters.status')}
                    </label>
                    <Selector
                        options={statusOptions}
                        selectedItems={getFilter('statuses')?.[0] || ''}
                        setSelectedItems={handleStatusChange}
                        placeholder={t('links.filters.selectStatus')}
                    />
                </div>
            </div>
        </div>
    );
};

export default LinksFilters;