import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import SecondaryLink from '@/Components/SecondaryLink';
import { MetricEnum } from '@/enums/metrics-enums';
import CatalystIntro from '@/Pages/Home/Partials/CatalystIntro';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { PageProps } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute.ts';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import MetricCardLoading from '../Metrics/Partials/MetricCardLoading';
import MetricCardList from '../Metrics/Partials/MetricsCardList';
import PostListLoader from '../Posts/Partials/PostListLoader';
import ProposalList from '../Proposals/Partials/ProposalList';
import AnnouncementCarousel from './Partials/Announcement/AnnouncementCarousel';
import SpecialAnnouncementLoading from './Partials/Announcement/SpecialAnnouncementLoading';
import SpecialAnnouncementCarousel from './Partials/Announcement/SpecialAnnouncementsCarousel';
import QuickPitchList from './Partials/QuickPitches/QuickPitchList';
import MetricData = App.DataTransferObjects.MetricData;
import ProposalData = App.DataTransferObjects.ProposalData;
import PostData = App.DataTransferObjects.PostData;
import AnnouncementData = App.DataTransferObjects.AnnouncementData;

interface HomePageProps extends Record<string, unknown> {
    posts: PostData[];
    proposals: ProposalData[];
    metrics: MetricData[];
    announcements: AnnouncementData[];
    specialAnnouncements: AnnouncementData[];
    quickPitches: ProposalData[];
}

export default function Index({
    posts,
    proposals,
    metrics,
    announcements,
    specialAnnouncements,
    quickPitches,
}: PageProps<HomePageProps>) {
    const { t } = useLaravelReactI18n();
    const [isHorizontal, setIsHorizontal] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        console.log(quickPitches);
    }, [quickPitches]);
    return (
        <>
            <Head title="Catalyst Explorer" />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <CatalystIntro />

                <section
                    className="quickpitches-wrapper"
                    data-testid="quickpitches-section"
                >
                    <div className="container">
                        <Title level="2" className='mb-6'>{t('home.quickpitchTitle')}</Title>
                        <QuickPitchList quickPitches={quickPitches} />
                    </div>
                </section>

                <section
                    className="annnouncements-wrapper"
                    data-testid="announcements-section"
                >
                    <div className="container rounded-xl">
                        <WhenVisible
                            fallback={<div>{t('loading')}...</div>}
                            data="announcements"
                        >
                            <AnnouncementCarousel
                                announcements={announcements}
                            />
                        </WhenVisible>
                    </div>
                </section>

                <section
                    className="numbers-wrapper container"
                    data-testid="metrics-section"
                >
                    <div className="flex items-center justify-between">
                        <div data-testid="metrics-header">
                            <Title level="2">{t('metric.numbers')}</Title>
                            <Paragraph
                                size="sm"
                                className="text-4 text-content-dark opacity-70"
                            >
                                {t('metric.subtitle')}
                            </Paragraph>
                        </div>
                        <div>
                            <SecondaryLink
                                className="text-content-dark font-bold"
                                href="/charts"
                                data-testid="see-more-metrics"
                            >
                                {t('metric.seeMore')}
                            </SecondaryLink>
                        </div>
                    </div>
                    <WhenVisible
                        fallback={<MetricCardLoading />}
                        data="metrics"
                    >
                        <MetricCardList
                            metrics={metrics}
                            sortBy={MetricEnum.ORDER}
                            sortOrder={MetricEnum.DESCENDING}
                            columns={MetricEnum.THREE_COLUMNS}
                        />
                    </WhenVisible>
                </section>

                <section
                    className="proposals-wrapper container"
                    data-testid="proposals-section"
                >
                    <div className="flex items-center justify-between py-8">
                        <div data-testid="proposals-header">
                            <Title level="2">
                                {t('proposals.celebrateCompletedProposals')}
                            </Title>
                            <Paragraph
                                size="sm"
                                className="text-4 text-content-dark opacity-70"
                            >
                                {t(
                                    'proposals.celebrateCompletedProposalsSubtitle',
                                )}
                            </Paragraph>
                        </div>
                        <div>
                            <SecondaryLink
                                className="text-content-dark font-bold"
                                href={useLocalizedRoute('proposals.index')}
                                data-testid="see-more-proposals"
                            >
                                {t('proposals.seeMoreProposals')}
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

                <section
                    className="special-announcements-wrapper container"
                    data-testid="special-announcements-section"
                >
                    <WhenVisible
                        fallback={<SpecialAnnouncementLoading />}
                        data="specialAnnouncements"
                    >
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

                <section
                    className="posts-wrapper container flex flex-col gap-8 py-8"
                    data-testid="catalyst-posts-section"
                >
                    <div data-testid="catalyst-posts-header">
                        <Title level="2">{t('posts.title')}</Title>
                        <Paragraph>{t('posts.subtitle')}</Paragraph>
                    </div>
                    <WhenVisible fallback={<PostListLoader />} data="posts">
                        <ul
                            className="content-gap scrollable snaps-scrollable"
                            data-testid="catalyst-posts-list"
                        >
                            {posts &&
                                posts.length &&
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
