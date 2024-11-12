import { Head } from '@inertiajs/react';

const SearchResults = () => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const query = params.get('q');
  const filters = params.get('f');

    return (
        <>
            <Head title="Search Results" />
            <div className="flex flex-col h-screen w-full items-center justify-center">
                <h1>Search Results</h1>
                <p>Query: {query}</p>
                <p>Filters: {filters}</p>
            </div>
        </>
    );
};

export default SearchResults;