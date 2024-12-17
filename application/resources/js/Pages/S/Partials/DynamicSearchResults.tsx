import ConcentricCirclesCenter from '@/assets/images/bg-concentric-circles-center.png';
import NavLink from '@/Components/NavLink';
import FileTypeIcon from '@/Components/svgs/FileTypeIcon';
import IdeascaleProfileCard from '@/Pages/People/Partials/IdeascaleProfileCard';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import { Button } from '@headlessui/react';
import { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
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
        | IdeascaleProfileData[]
        | GroupData[];
    articles: PostData[];
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
export const EmptyState = ({
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

const DynamicSearchResults = ({
    name,
    data = {} as SearchResultsData,
}: DynamicSearchResultsProps) => {
    const [isHorizontal] = useState(false);
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const urlQuery = params.get('q') as string;
    const [quickPitchView, setQuickPitchView] = useState(false);
    const setGlobalQuickPitchView = (value: boolean) =>
        setQuickPitchView(value);

    useEffect(() => {
        const query = data?.query ? data.query : urlQuery;
        setQuery(query);
    }, [query, urlQuery]);

    const isEmpty =
        !data || name.toLowerCase() === 'articles'
            ? !data?.articles?.length
            : !data?.hits?.length;

    if (isEmpty) {
        return <EmptyState query={query} translation={t} />;
    }

    const renderResults = (
        translation: TFunction<'translation', undefined>,
    ) => {
        switch (name.toLowerCase()) {
            case 'proposals':
                return (
                    <div className="flex flex-col gap-4">
                        <h1 className="title-1">{t('proposals.proposals')}</h1>
                        <ProposalResults
                            proposals={data.hits as ProposalData[]}
                            isHorizontal={isHorizontal}
                            quickPitchView={quickPitchView}
                            setGlobalQuickPitchView={setGlobalQuickPitchView}
                        />
                        <div className="flex w-full items-center justify-center">
                            <NavLink href={`/proposals?q=${query}`}>
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
                return (
                    <div className="flex w-full flex-col gap-4">
                        <h1 className="title-1">{t('people')}</h1>
                        <section className="py-8">
                            <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                {data.hits.map((user, index) => (
                                    <li key={index}>
                                        <IdeascaleProfileCard
                                            ideascaleProfile={user}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <div className="flex w-full items-center justify-center">
                            <NavLink href={`/people?q=${query}`}>
                                <Button className="text-center">
                                    {translation(
                                        'searchResults.results.viewMore',
                                    )}
                                </Button>
                            </NavLink>
                        </div>
                    </div>
                );
            case 'groups':
                return (
                    <div className="flex flex-col gap-4">
                        <div>"Coming soon"</div>

                        <div className="flex w-full items-center justify-center">
                            <NavLink href={`/groups?q=${query}`}>
                                <Button className="text-center">
                                    {translation(
                                        'searchResults.results.viewMore',
                                    )}
                                </Button>
                            </NavLink>
                        </div>
                    </div>
                );
            case 'communities':
                return (
                    <div className="flex flex-col gap-4">
                        <div>"Coming soon"</div>

                        <div className="flex w-full items-center justify-center">
                            <NavLink href={`/communities?q=${query}`}>
                                <Button className="text-center">
                                    {translation(
                                        'searchResults.results.viewMore',
                                    )}
                                </Button>
                            </NavLink>
                        </div>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="flex flex-col gap-4">
                        <div>"Coming soon"</div>

                        <div className="flex w-full items-center justify-center">
                            <NavLink href={`/reviews?q=${query}`}>
                                <Button className="text-center">
                                    {translation(
                                        'searchResults.results.viewMore',
                                    )}
                                </Button>
                            </NavLink>
                        </div>
                    </div>
                );
            case 'articles':
                return (
                    <div className="flex flex-col gap-4">
                        {data.articles.map((article) => (
                            <PostCard key={article.id} post={article} />
                        ))}

                        <div className="flex w-full items-center justify-center">
                            <NavLink href={`/posts?q=${query}`}>
                                <Button className="text-center">
                                    {translation(
                                        'searchResults.results.viewMore',
                                    )}
                                </Button>
                            </NavLink>
                        </div>
                    </div>
                );
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
