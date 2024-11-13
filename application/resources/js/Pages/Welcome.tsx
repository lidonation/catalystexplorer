import SearchBar from '@/Components/SearchBar';
import PostCard from '@/Components/PostCard';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';


export default function Welcome({ }: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <>
            <Head title="Welcome" />
            
            <div className="flex flex-col gap-8 h-screen w-full items-center justify-center">
                <SearchBar autoFocus />

                <div>
                    <PostCard />
                </div>
            </div>
        </>
    );
}
