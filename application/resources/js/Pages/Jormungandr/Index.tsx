import { Head } from '@inertiajs/react';

const Index = () => {
    return (
        <>
            <Head title="Jormungandr"/>

            <header>
                <div className='container'>
                    <h1 className="title-1">Jormungandr</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                        Search proposals and challenges by title, content, or author and co-authors
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
