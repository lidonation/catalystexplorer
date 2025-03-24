import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import Paragraph from '@/Components/atoms/Paragraph';

const Index = () => {
    return (
        <>
            <Head title="Numbers"/>

            <header>
                <div className='container'>
                    <Title >Numbers</Title>
                </div>
                <div className='container'>
                    <Paragraph className="text-content">
                        Search proposals and challenges by title, content, or author and co-authors
                    </Paragraph>
                </div>
            </header>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Title level='2'>Coming Soon</Title>
            </div>
        </>
    );
};

export default Index;
