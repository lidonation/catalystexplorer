import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import Paragraph from '@/Components/atoms/Paragraph';

const Index = () => {
    return (
        <>
            <Head title="Connections"/>

            <header>
                <div className='container'>
                    <Title>Connections</Title>
                </div>
                <div className='container'>
                    <Paragraph className="text-content">
                        View connections between proposals, challenges, and community members
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