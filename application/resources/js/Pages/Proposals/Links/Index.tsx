import React from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalLayout from '../ProposalLayout';
import LinkCard from '@/Components/atoms/LinkCard';
import Paragraph from '@/Components/atoms/Paragraph.tsx';

interface LinkData {
    id: string;
    title?: string;
    link: string;
    type: string;
    label?: string;
    status: string;
    valid: boolean;
}

interface IndexProps {
    proposal: App.DataTransferObjects.ProposalData & {
        links?: LinkData[];
    };
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    userCompleteProposalsCount?: number;
    userOutstandingProposalsCount?: number;
    catalystConnectionsCount?: number;
}

const Index: React.FC<IndexProps> = ({
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView
}) => {
    const { t } = useLaravelReactI18n();

    const links = proposal.links || [];
    const activeLinks = links.filter((link: { valid: any; status: string; }) => link.valid && link.status === 'published');
    const inactiveLinks = links.filter((link: { valid: any; status: string; }) => !link.valid || link.status !== 'published');

    const specialLinks: LinkData[] = [];

    if (proposal.ideascale_link) {
        specialLinks.push({
            id: `ideascale-${proposal.id}`,
            title: 'Ideascale Proposal',
            link: proposal.ideascale_link,
            type: 'ideascale',
            label: 'Ideascale',
            status: 'published',
            valid: true
        });
    }

    if (proposal.projectcatalyst_io_link) {
        specialLinks.push({
            id: `projectcatalyst-${proposal.id}`,
            title: 'Project Catalyst',
            link: proposal.projectcatalyst_io_link,
            type: 'catalyst',
            label: 'Project Catalyst',
            status: 'published',
            valid: true
        });
    }

    // Group links by type for better organization
    const groupedLinks = links.reduce((acc: { [x: string]: any[]; }, link: { type: string; }) => {
        const type = link.type || 'website';
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(link);
        return acc;
    }, {} as Record<string, LinkData[]>);

    const linkTypeOrder = [
        'website',
        'repository',
        'github',
        'documentation',
        'youtube',
        'twitter',
        'linkedin',
        'facebook',
        'instagram',
        'telegram',
        'discord'
    ];

    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
        >
            <div className="bg-background shadow-cx-box-shadow flex flex-col items-start justify-between gap-5 self-stretch rounded-xl p-4 sm:flex-row sm:gap-2 sm:p-6">
                <div className="flex w-full items-center justify-start gap-4 overflow-x-auto">
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.links.totalLinks')}
                        </div>
                        <div className="text-content text-base">
                            {links.length + specialLinks.length}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.links.activeLinks')}
                        </div>
                        <div className="text-content text-base">
                            {activeLinks.length}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.links.linkTypes')}
                        </div>
                        <div className="text-content text-base">
                            {Object.keys(groupedLinks).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Links content */}
            <div className="bg-background shadow-cx-box-shadow mt-4 rounded-xl p-6">
                <div className="border-gray-persist/80 mb-6 border-b pb-4">
                    <h2 className="text-content text-xl font-semibold">
                        {t('proposals.links.title')}
                    </h2>
                    <p className="text-gray-persist text-sm mt-2">
                        {t('proposals.links.description')}
                    </p>
                </div>

                {links.length === 0 && specialLinks.length === 0 ? (
                    // Empty state
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
                            {t('proposals.links.noLinks')}
                        </h3>
                        <Paragraph className="text-gray-persist text-sm max-w-md mx-auto">
                            {t('proposals.links.noLinksDescription')}
                        </Paragraph>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Special links */}
                        {specialLinks.length > 0 && (
                            <div>
                                <h3 className="text-content text-lg font-medium mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v1M7 4V3a1 1 0 011-1h8a1 1 0 011 1v1M7 4l-1 1h12l-1-1M6 5v14a2 2 0 002 2h8a2 2 0 002-2V5M6 5H4a1 1 0 00-1 1v1a1 1 0 001 1h1M18 5h2a1 1 0 011 1v1a1 1 0 01-1 1h-1" />
                                    </svg>
                                    {t('proposals.links.officialLinks')} ({specialLinks.length})
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                                    {specialLinks.map((link) => (
                                        <LinkCard
                                            key={link.id}
                                            link={link}
                                            className="border-2 border-blue-100 dark:border-blue-800"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Active links */}
                        {activeLinks.length > 0 && (
                            <div>
                                <h3 className="text-content text-lg font-medium mb-4">
                                    {t('proposals.links.activeLinks')} ({activeLinks.length})
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                                    {activeLinks.map((link: any) => (
                                        <LinkCard
                                            key={link.id}
                                            link={link}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Inactive links */}
                        {inactiveLinks.length > 0 && (
                            <div>
                                <h3 className="text-content text-lg font-medium mb-4">
                                    {t('proposals.links.inactiveLinks')} ({inactiveLinks.length})
                                </h3>
                                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
                                    {inactiveLinks.map((link: any) => (
                                        <LinkCard
                                            key={link.id}
                                            link={link}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ProposalLayout>
    );
};

export default Index;
