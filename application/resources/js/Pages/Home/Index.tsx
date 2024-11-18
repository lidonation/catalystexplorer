import CatalystIntro from '@/Pages/Home/Partials/CatalystIntro';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import { PageProps, Post } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import PostListLoader from '../Posts/Partials/PostListLoader';
import ProposalCard from '../Proposals/Partials/ProposalCard';
import ProposalCardLoading from '../Proposals/Partials/ProposalCardLoading';

interface HomePageProps extends Record<string, unknown> {
    posts: Post[];
    proposals: App.DataTransferObjects.ProposalData[];
}

export default function Index({ posts, proposals }: PageProps<HomePageProps>) {
    return (
        <>
            <Head title="Catalyst Explorer" />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <CatalystIntro />

                <section className="numbers-wrapper py-16"></section>

                <WhenVisible
                    fallback={<ProposalCardLoading />}
                    data="proposals"
                >
                    <section className="proposals-wrapper">
                        <div className="max-h80 container overflow-auto py-8">
                            <h2 className="title-2">Proposals</h2>
                        </div>
                        <div className="content-gap container flex flex-nowrap">
                            {proposals &&
                                proposals.map((proposal) => (
                                    <ProposalCard
                                        key={proposal.id}
                                        proposal={proposal}
                                    />
                                ))}
                        </div>
                    </section>
                </WhenVisible>

                <section className="special-announcements-wrapper"></section>

                <section className="posts-wrapper container flex flex-col gap-8">
                    <div>
                        <h2 className="title-2">Catalysts Posts</h2>
                        <p>Latest news and posts from our community</p>
                    </div>
                    <WhenVisible fallback={<PostListLoader />} data="posts">
                        <ul className="content-gap scrollable snaps-scrollable">
                            {posts &&
                                posts.map((post: Post) => (
                                    <li key={post.id}>
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
