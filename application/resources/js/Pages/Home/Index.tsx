import SearchBar from '@/Components/SearchBar';
import PostCard from '@/Pages/Posts/Partials/PostCard';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import ProposalCard from '../Proposals/Partials/ProposalCard';

export default function Welcome({}: PageProps<{
    laravelVersion: string;
    phpVersion: string;
}>) {
    return (
        <>
            <Head title="Catalyst Explorer" />

            <div className="flex w-full flex-col justify-center gap-8">
                <section className="splash-wrapper py-16">
                    <div className="container">
                        <SearchBar autoFocus />
                    </div>
                </section>

                <section className="numbers-werapper py-16"></section>

                <section className="propoals-wrapper py-16">
                    <div className="content-gap container flex flex-nowrap overflow-x-scroll">
                        <ProposalCard />
                        <ProposalCard />
                        <ProposalCard />
                    </div>
                </section>

                <section className="special-announcements-wrapper"></section>

                <section className="posts-wrapper">
                    <div className="content-gap container flex flex-nowrap overflow-x-scroll">
                        <PostCard />
                        <PostCard />
                        <PostCard />
                    </div>
                </section>
            </div>
        </>
    );
}
