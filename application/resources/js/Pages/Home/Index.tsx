import CatalystIntro from '@/Pages/Home/Partials/CatalystIntro';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import { PageProps, Post } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import PostListLoader from '../Posts/Partials/PostListLoader';
import ProposalList from '../Proposals/Partials/ProposalList';
import ProposalCardLoading from '../Proposals/Partials/ProposalCardLoading';
import { useTranslation } from 'react-i18next';
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
}

export default function Index({ posts, proposals, metrics, announcements, specialAnnouncements }: PageProps<HomePageProps>) {
    const { t } = useTranslation();
    return (
        <>
            <Head title="Catalyst Explorer" />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <CatalystIntro />

                <section className="annnouncements-wrapper py-16">
                    <div className='container'>
                        <div className=" overflow-auto py-8">
                            <h2 className="title-2">Announcements Data</h2>
                        </div>
                        <WhenVisible fallback={<div>Loading...</div>} data="announcements">
                            {JSON.stringify(announcements)}
                        </WhenVisible>
                    </div>
                </section>

                <section className="numbers-wrapper py-16">
                    <div className='container'>
                        <div className=" overflow-auto py-8">
                            <h2 className="title-2">Metrics Data</h2>
                        </div>
                        <WhenVisible fallback={<div>Loading...</div>} data="metrics">
                            {JSON.stringify(metrics)}
                        </WhenVisible>
                    </div>
                </section>

                <WhenVisible
                    fallback={<ProposalCardLoading/>}
                    data="proposals"
                >
                    <ProposalList proposals={proposals}/>
                </WhenVisible>

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
