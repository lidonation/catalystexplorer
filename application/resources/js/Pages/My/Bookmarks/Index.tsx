import { Head } from '@inertiajs/react';

const Index = () => {
    return (
        <>
            <Head title="Jormungandr"/>

            <header>
                <div className='container'>
                    <h1 className="title-1">My Bookmarks</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                        All your bookmarked proposals, groups, ideascale profiles in one place.
                    </p>
                </div>
            </header>

            <div className="flex flex-col h-screen w-full items-center justify-center">
                <h1>Coming Soon</h1>
            </div>
        </>
    );
};

export default Index;
