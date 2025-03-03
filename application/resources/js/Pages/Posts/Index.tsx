import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';

const Index = () => {
    return (
        <>
            <Head title="Proposals" />

            <header>
                <div className='container'>
                    <Title level='1'>Proposals</Title>
                </div>
                <div className='container'>
                    <p className="text-content">
                        Search proposals and challenges by title, content, or author and co-authors
                    </p>
                </div>
            </header>

            <div className="flex flex-col h-screen w-full items-center justify-center">
                <Title level='2'>Proposals</Title>
            </div>
        </>
    );
};

export default Index;
