import CatalystIntro from '@/Pages/Home/Partials/CatalystIntro';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import { PageProps } from '@/types';
import { useState } from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import PostListLoader from '../Posts/Partials/PostListLoader';
import ProposalList from '../Proposals/Partials/ProposalList';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import MetricCardList from '../Metrics/Partials/MetricsCardList';
import MetricCardLoading from '../Metrics/Partials/MetricCardLoading';
import { useTranslation } from 'react-i18next';
import { MetricEnum } from '@/enums/metrics-enums';
import MetricData = App.DataTransferObjects.MetricData;
import ProposalData = App.DataTransferObjects.ProposalData;
import PostData = App.DataTransferObjects.PostData;
import AnnouncementData = App.DataTransferObjects.AnnouncementData;
import AnnouncementCarousel from './Partials/Announcement/AnnouncementCarousel';
import SecondaryLink from '@/Components/SecondaryLink';
import SpecialAnnouncementCarousel from './Partials/Announcement/SpecialAnnouncementsCarousel';
import SpecialAnnouncementLoading from './Partials/Announcement/SpecialAnnouncementLoading';

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
    const { t } = useTranslation();
    const [isHorizontal, setIsHorizontal] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    return (
        <>
            <Head title="Catalyst Explorer" />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <CatalystIntro />

                <section className="annnouncements-wrapper">
                    <div className='container rounded-xl'>
                        <WhenVisible fallback={<div>{t("loading")}...</div>} data="announcements">
                            <AnnouncementCarousel announcements={announcements} />
                        </WhenVisible>
                    </div>
                </section>

                <section className="container numbers-wrapper">
                    <div className='flex justify-between items-center'>
                        <div>
                            <h2 className="title-2">{t("metric.numbers")}</h2>
                            <p className="text-4 text-content-dark opacity-70">{t("metric.subtitle")}</p>
                        </div>
                        <div>
                            <SecondaryLink className="font-bold text-content-dark" href="/charts">
                                {t("metric.seeMore")}
                            </SecondaryLink>
                        </div>
                    </div>
                    <WhenVisible fallback={<MetricCardLoading />} data="metrics">
                        <MetricCardList
                            metrics={metrics}
                            sortBy={MetricEnum.ORDER}
                            sortOrder={MetricEnum.DESCENDING}
                            columns={MetricEnum.THREE_COLUMNS} />
                    </WhenVisible>
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
                        fallback={<VerticalCardLoading />}
                        data="proposals"
                    >
                        <ProposalList
                            proposals={proposals}
                            isHorizontal={isHorizontal}
                        />
                    </WhenVisible>
                </section>

                <section className="special-announcements-wrapper container">
                    <WhenVisible fallback={<SpecialAnnouncementLoading />} data="specialAnnouncements">
                        {specialAnnouncements && (
                            <SpecialAnnouncementCarousel
                                announcements={specialAnnouncements}
                                activeIndex={activeIndex}
                                setActiveIndex={setActiveIndex}
                                isTransitioning={isTransitioning}
                                setIsTransitioning={setIsTransitioning}
                            />
                        )}
                    </WhenVisible>
                </section>

                <section className="posts-wrapper container flex flex-col gap-8">
                    <div>
                        <h2 className="title-2">{t('posts.title')}</h2>
                        <p>{t('posts.subtitle')}</p>
                    </div>
                    <WhenVisible fallback={<PostListLoader />} data="posts">
                        <ul className="content-gap scrollable snaps-scrollable">
                            {posts &&
                                posts.map((post) => (
                                    <li key={post?.id}>
                                        <PostCard post={post} />
                                    </li>
                                ))}
                        </ul>
                    </WhenVisible>
                </section>
            </div>
        </>
    );
}
