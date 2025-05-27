import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeaScaleProfileLoader from '@/Pages/IdeascaleProfile/Partials/IdeaScaleProfileLoader';
import RelatedIdeascaleProfilesList from '@/Pages/IdeascaleProfile/Partials/RelatedIdeascaleProfileList';
import { Head, WhenVisible } from '@inertiajs/react';
import { PaginatedData } from '../../../types/paginated-data';
import CommunityLayout from '../CommunityLayout';
import CommunityData = App.DataTransferObjects.CommunityData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface DashboardPageProps {
    community: CommunityData;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    ownProposals: number;
    collaboratingProposals: number;
}

export default function Proposals({
    community,
    ideascaleProfiles,
    ownProposals,
    collaboratingProposals,
}: DashboardPageProps) {
    return (
        <CommunityLayout
            community={community}
            ownProposalsCount={ownProposals}
            coProposalsCount={collaboratingProposals}
        >
            <Head title={`${community?.title} - Members`} />
            <WhenVisible
                data="ideascaleProfiles"
                fallback={<IdeaScaleProfileLoader />}
            >
                {ideascaleProfiles?.data ? (
                    <>
                        <div className="w-full overflow-auto">
                            {typeof ideascaleProfiles?.data !== 'undefined' && (
                                <RelatedIdeascaleProfilesList
                                    ideascaleProfiles={ideascaleProfiles}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <RecordsNotFound />
                )}
            </WhenVisible>
        </CommunityLayout>
    );
}
