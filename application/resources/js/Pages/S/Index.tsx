import { Head, WhenVisible } from '@inertiajs/react';

type SearchResultsProps = {
    counts: any;
    proposals: any;
    people: any;
    groups: any;
    communities: any;
    reviews: any;
    posts: any;
};

const SearchResults = ({
    counts,
    proposals,
    people,
    groups,
    communities,
    reviews,
    posts,
}: SearchResultsProps) => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const query = params.get('q');
    const filters = params.get('f');

    return (
        <>
            <Head title="Search Results" />
            <div className="container min-h-screen">
                <div className="flex w-full flex-col items-center justify-center">
                    <h1>Search Results</h1>
                    <p>Query: {query}</p>
                    <p>Filters: {filters}</p>
                    <p>{JSON.stringify(counts)}</p>
                </div>

                <div className="flex w-full flex-col">
                    <WhenVisible data="proposals" fallback="loading">
                        <div className="flex flex-col gap-2">
                            <span className="title-1 font-bold">Proposals</span>
                            <div className="overflow-hidden break-words">
                                {JSON.stringify(proposals)}
                            </div>
                        </div>
                    </WhenVisible>

                    <div className='h-screen w-full'>Testing WhenVisible</div>

                    <WhenVisible data="people" fallback="loading...">
                        <div className="mt-4 flex flex-col gap-2">
                            <span className="title-1 font-bold">People</span>
                            <div className="overflow-hidden break-words">
                                {JSON.stringify(people)}
                            </div>
                        </div>
                    </WhenVisible>
                    <WhenVisible data="groups" fallback="loading...">
                        <div className="mt-80 flex flex-col gap-2">
                            <span className="title-1 font-bold">Groups</span>
                            <div className="overflow-hidden break-words">
                                {JSON.stringify(groups)}
                            </div>
                        </div>
                    </WhenVisible>
                    <WhenVisible data="communities" fallback="loading...">
                        <div className="mt-80 flex flex-col gap-2">
                            <span className="title-1 font-bold">
                                Communities
                            </span>
                            <div className="overflow-hidden break-words">
                                {JSON.stringify(communities)}
                            </div>
                        </div>
                    </WhenVisible>
                    <WhenVisible data="reviews" fallback="loading...">
                        <div className="mt-80 flex flex-col gap-2">
                            <span className="title-1 font-bold">Reviews</span>
                            <div className="overflow-hidden break-words">
                                {JSON.stringify(reviews)}
                            </div>
                        </div>
                    </WhenVisible>
                    <WhenVisible data="posts" fallback="loading...">
                        <div className="mt-80 flex flex-col gap-2">
                            <span className="title-1 font-bold">Posts</span>
                            <div className="overflow-hidden break-words">
                                {JSON.stringify(posts)}
                            </div>
                        </div>
                    </WhenVisible>
                </div>
            </div>
        </>
    );
};

export default SearchResults;
