import { Head } from '@inertiajs/react';

const Index = () => {
    return (
        <>
            <Head title="Jormungandr"/>

            <header>
                <div className='container'>
                    <h1 className="title-1">My Lists</h1>
                </div>
                <div className='container'>
                    <p className="text-content">
                        Your, research, and voting lists.
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
