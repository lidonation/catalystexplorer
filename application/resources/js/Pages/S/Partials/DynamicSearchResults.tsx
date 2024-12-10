import ConcentricCirclesCenter from '@/assets/images/bg-concentric-circles-center.png';
import NavLink from '@/Components/NavLink';
import FileTypeIcon from '@/Components/svgs/FileTypeIcon';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import { Button } from '@headlessui/react';
import { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AnnouncementData = App.DataTransferObjects.AnnouncementData;
import CampaignData = App.DataTransferObjects.CampaignData;
import CommunityData = App.DataTransferObjects.CommunityData;
import PostData = App.DataTransferObjects.PostData;
import ProposalData = App.DataTransferObjects.ProposalData;
import ReviewData = App.DataTransferObjects.ReviewData;
import UserData = App.DataTransferObjects.UserData;
import GroupData = App.DataTransferObjects.GroupData;

interface SearchResultsData {
    hits:
        | AnnouncementData[]
        | CampaignData[]
        | CommunityData[]
        | ProposalData[]
        | ReviewData[]
        | UserData[]
        | GroupData[];
    posts: PostData[];
    query: string;
    limit: number;
    offset: number;
    estimatedTotalHits: number;
    processingTimeMs: number;
}

interface DynamicSearchResultsProps {
    name: string;
    data: SearchResultsData;
}
const EmptyState = ({
    query,
    translation,
}: {
    query: string;
    translation: TFunction<'translation', undefined>;
}) => (
    <div className="flex h-screen w-full items-center justify-center">
        <div
            className="flex h-full w-full flex-col items-center justify-center gap-4"
            style={{
                backgroundImage: `url(${ConcentricCirclesCenter})`,
                backgroundPosition: '50% 15%',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-gradient-to-b from-gray-50 to-gray-100">
                <FileTypeIcon />
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="font-bold">
                    {translation('searchResults.noResults.title')}
                </span>
                <span className="text-content-lighter text-wrap">
                    {translation('searchResults.noResults.description', {
                        query,
                    })}
                </span>
            </div>
        </div>
    </div>
);

const DynamicSearchResults = ({ name, data }: DynamicSearchResultsProps) => {
    const [isHorizontal] = useState(false);
    const { t } = useTranslation();
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const urlQuery = params.get('q') as string;
    const query = data?.query ? data.query : urlQuery;
    data.query = query;
    const [quickPitchView, setQuickPitchView] = useState(false);
    const setGlobalQuickPitchView = (value: boolean) =>
        setQuickPitchView(value);

    const isEmpty =
        name.toLowerCase() === 'posts'
            ? !data?.posts?.length
            : !data?.hits?.length;

    if (isEmpty) {
        return <EmptyState query={data.query} translation={t} />;
    }

    const renderResults = (
        translation: TFunction<'translation', undefined>,
    ) => {
        switch (name.toLowerCase()) {
            case 'proposals':
                return (
                    <div className="flex flex-col gap-4">
                        <ProposalResults
                            proposals={data.hits as ProposalData[]}
                            isHorizontal={isHorizontal}
                            quickPitchView={quickPitchView}
                            setGlobalQuickPitchView={setGlobalQuickPitchView}
                        />
                        <div className="flex w-full items-center justify-center">
                            <NavLink href="/proposals">
                                <Button className="text-center">
                                    {translation(
                                        'searchResults.results.viewMore',
                                    )}
                                </Button>
                            </NavLink>
                        </div>
                    </div>
                );
            case 'people':
                return 'Coming soon';
            case 'groups':
                return 'Coming soon';
            case 'communities':
                return 'Coming soon';
            case 'reviews':
                return 'Coming soon';
            case 'posts':
                return data.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ));
            default:
                return null;
        }
    };

    return (
        <div className="flex w-full flex-col items-center justify-center px-2 py-4">
            {renderResults(t)}
        </div>
    );
};

export default DynamicSearchResults;
