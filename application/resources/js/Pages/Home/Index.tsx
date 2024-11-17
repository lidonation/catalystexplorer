import CatalystIntro from '@/Pages/Home/Partials/CatalystIntro';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import ProposalCard from '../Proposals/Partials/ProposalCard';
import ProposalCardLoading from '../Proposals/Partials/ProposalCardLoading';

interface HomePageProps extends Record<string, unknown> {
    posts: any;
    proposals: App.DataTransferObjects.ProposalData[];
}

export default function Index({ posts, proposals }: PageProps<HomePageProps>) {
    return (
        <>
            <Head title="Catalyst Explorer" />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <CatalystIntro />

                <section className="numbers-werapper py-16"></section>

                <WhenVisible
                    fallback={<ProposalCardLoading/>}
                    data="proposals"
                >
                    <section className="propoals-wrapper">
                        <div className="max-h80 container overflow-auto py-8">
                            <h2 className="title-2">Proposals:</h2>
                        </div>
                        <div className="content-gap container flex flex-nowrap overflow-x-scroll">
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

                <WhenVisible fallback="ProposalCardLoading" data="posts">
                    <section className="posts-wrapper">
                        <div className="max-h80 container overflow-auto py-8">
                            <h2 className="title-2">Your data:</h2>
                            {JSON.stringify(posts)}
                        </div>
                        <div className="content-gap container flex flex-nowrap overflow-x-scroll">
                            <PostCard />
                            <PostCard />
                            <PostCard />
                        </div>
                    </section>
                </WhenVisible>
            </div>
        </>
    );
}
