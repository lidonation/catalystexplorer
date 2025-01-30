import { Head } from '@inertiajs/react';

const Index = () => {
    return (
        <>
            <Head title="Charts"/>

            <header>
                <div className='container'>
                    <h1 className="title-1">Charts</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                        Search proposals and challenges by title, content, or author and co-authors
                    </p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <h1>Coming Soon</h1>
            </div>
        </>
    );
};

export default Index;
