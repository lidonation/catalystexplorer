import CatalystIntro from '@/Pages/Home/Partials/CatalystIntro';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import {PageProps} from '@/types';
import {Head, router, WhenVisible} from '@inertiajs/react';
import PostListLoader from '../Posts/Partials/PostListLoader';
import ProposalList from '../Proposals/Partials/ProposalList';
import ProposalCardLoading from '../Proposals/Partials/ProposalCardLoading';
import MetricCard from '../Metrics/Partials/MetricCard';
import MetricCardLoading from '../Metrics/Partials/MetricCardLoading';
import { useTranslation } from 'react-i18next';
import MetricData = App.DataTransferObjects.MetricData;
import ProposalData = App.DataTransferObjects.ProposalData;
import PostData = App.DataTransferObjects.PostData;
import AnnouncementData = App.DataTransferObjects.AnnouncementData;
import AnnouncementCarousel from './Partials/Announcement/AnnouncementCarousel';
import SecondaryLink from '@/Components/SecondaryLink';

interface HomePageProps extends Record<string, unknown> {
    posts: PostData[];
    proposals: ProposalData[];
    metrics: MetricData[];
    announcements: AnnouncementData[];
    specialAnnouncements: AnnouncementData[];
}

export default function Index({
                                  posts,
                                  proposals,
                                  metrics,
                                  announcements,
                                  specialAnnouncements
                              }: PageProps<HomePageProps>) {
    const {t} = useTranslation();

    function navigate() {
        router.get('/proposals')
    }
    return (
        <>
            <Head title="Catalyst Explorer"/>

            <div className="relative flex w-full flex-col justify-center gap-8">
                <CatalystIntro />

                <section className="annnouncements-wrapper">
                    <div className='container rounded-xl'>
                        <WhenVisible fallback={<div>Loading...</div>} data="announcements">
                            <AnnouncementCarousel announcements={announcements}/>
                        </WhenVisible>
                    </div>
                </section>

                <section className="numbers-wrapper">
                    <div className='container'>
                        <div>
                            <h2 className="title-2">{t("numbers")}</h2>
                            <p className="text-4 text-content-dark opacity-70">{t("proposals.listSubtitle")}</p>
                        </div>
                        <WhenVisible fallback={<MetricCardLoading/>} data="metrics">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                {metrics && metrics.map((metric) => (
                                    <MetricCard
                                        key={metric.user_id}
                                        metric={metric}
                                    />
                                ))}
                            </div>
                        </WhenVisible>
                    </div>
                </section>

                <section className="container proposals-wrapper">
                    <div className=" py-8 flex justify-between items-center">
                        <div>
                            <h2 className="title-2">{t("proposals.proposals")}</h2>
                            <p className="text-4 text-content-dark opacity-70">{t("proposals.listSubtitle")}</p>
                        </div>
                        <div>
                            <SecondaryLink className="font-bold text-content-dark" href="/proposals">
                                {t("proposals.seeMoreProposals")}
                            </SecondaryLink>
                        </div>
                    </div>
                    <WhenVisible
                        fallback={<ProposalCardLoading/>}
                        data="proposals"
                    >
                        <ProposalList proposals={proposals}/>
                    </WhenVisible>
                </section>

                <section className="special-announcements-wrapper">
                    <div className='container'>
                        <div className=" overflow-auto py-8">
                            <h2 className="title-2">Special Announcements Data</h2>
                        </div>
                        <WhenVisible fallback={<div>Loading...</div>} data="specialAnnouncements">
                            {JSON.stringify(specialAnnouncements)}
                        </WhenVisible>
                    </div>
                </section>

                <section className="posts-wrapper container flex flex-col gap-8">
                    <div>
                        <h2 className="title-2">{t('posts.title')}</h2>
                        <p>{t('posts.subtitle')}</p>
                    </div>
                    <WhenVisible fallback={<PostListLoader/>} data="posts">
                        <ul className="content-gap scrollable snaps-scrollable">
                            {posts &&
                                posts.map((post) => (
                                    <li key={post?.id}>
                                        <PostCard post={post}/>
                                    </li>
                                ))}
                        </ul>
                    </WhenVisible>
                </section>
            </div>
        </>
    );
}
