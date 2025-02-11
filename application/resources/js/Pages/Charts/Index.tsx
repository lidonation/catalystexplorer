import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';

const Index = () => {
    return (
        <>
            <Head title="Charts"/>

            <header>
                <div className='container'>
                    <Title >Charts</Title>
                </div>
                <div className='container'>
                    <p className="text-content">
                        Search proposals and challenges by title, content, or author and co-authors
                    </p>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level='2'>Coming Soon</Title>
            </div>
        </>
    );
};

export default Index;
