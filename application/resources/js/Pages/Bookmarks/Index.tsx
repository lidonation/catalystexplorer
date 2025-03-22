import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';

const Index = () => {
    return (
        <>
            <Head title="Lists and Bookmarks"/>

            <header>
                <div className='container'>
                    <Title >Lists and Bookmarks</Title>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level='2'>Coming Soon</Title>
            </div>
        </>
    );
};

export default Index;
