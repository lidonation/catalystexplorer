import NavLink from '@/Components/NavLink';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import ProposalResults from '@/Pages/Proposals/Partials/ProposalResults';
import IdeascaleProfileCardMini from "@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCardMini";
import { Button } from '@headlessui/react';
import { useEffect, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import GroupCardMini from '@/Pages/Groups/Partials/GroupCardMini';
import AnnouncementData = App.DataTransferObjects.AnnouncementData;
import CampaignData = App.DataTransferObjects.CampaignData;
import CommunityData = App.DataTransferObjects.CommunityData;
import PostData = App.DataTransferObjects.PostData;
import ProposalData = App.DataTransferObjects.ProposalData;
import ReviewData = App.DataTransferObjects.ReviewData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import GroupData = App.DataTransferObjects.GroupData;
import Title from '@/Components/atoms/Title';
import { ReviewCard } from '@/Components/ReviewCard';
import CommunityCardMini from '@/Pages/Communities/Partials/CommunityCardMini';
import ReplacementsInterface from "laravel-react-i18n/dist/interfaces/replacements";

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

const DynamicSearchResults = ({
    name,
    data = {} as SearchResultsData,
}: DynamicSearchResultsProps) => {
    const [isHorizontal] = useState(false);
    const [isMini] = useState(true);
    const { t } = useLaravelReactI18n();
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
        return <RecordsNotFound context="search" searchTerm={query} />;
    }

    const renderResults = (
        translation: (key: string, replacements?: ReplacementsInterface) => string,
    ) => {
        switch (name.toLowerCase()) {
            case 'proposals':
                return (
                    <div className="flex flex-col gap-4">
                        <Title level='2'>{t('proposals.proposals')}</Title>
                        <ProposalResults
                            proposals={data.hits as ProposalData[]}
                            isHorizontal={isHorizontal}
                            isMini={isMini}
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
            case 'ideascaleprofiles':
                return (
                    <div className="flex w-full flex-col gap-4">
                        <Title>{t('ideascaleProfiles.ideascaleProfiles')}</Title>
                        <section className="py-8">
                            <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                                {data.hits.map((user, index) => (
                                    <li key={index}>
                                        <IdeascaleProfileCardMini
                                            ideascaleProfile={
                                                user as IdeascaleProfileData
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <div className="flex w-full items-center justify-center">
                            <NavLink href={`/ideascale-profiles?q=${query}`}>
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
                    <div className="flex w-full flex-col gap-4">
                        <Title level="2">
                            {t('searchResults.tabs.groups')}
                        </Title>
                        <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                            {data.hits.map((group, index) => (
                                <li key={index}>
                                    <GroupCardMini group={group as GroupData} />
                                </li>
                            ))}
                        </ul>
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
                    <div className="flex w-full flex-col gap-4">
                        <Title>{t('Communities')}</Title>
                        <section className="py-8">
                            <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 items-stretch">
                                {data.hits.map((community, index) => (
                                    <li key={index} className="flex">
                                        <CommunityCardMini
                                            community={community as CommunityData}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <div className="flex w-full items-center justify-center">
                            <NavLink href={`/communities?q=${query}`}>
                                <Button className="text-center">
                                    {translation('searchResults.results.viewMore')}
                                </Button>
                            </NavLink>
                        </div>
                    </div>
                );
            case 'reviews':
                return (
                    <div className="flex flex-col gap-4">
                        <Title level="2">{t('reviews.reviews')}</Title>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
                            {data.hits.map((review, index) => (
                                <section
                                    key={review.hash || index}
                                    className="relative mb-2"
                                >
                                    <ReviewCard review={review as ReviewData} />
                                </section>
                            ))}
                        </div>
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
