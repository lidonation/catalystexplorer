import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';

const Index = () => {
    return (
        <>
            <Head title="Jormungandr"/>

            <header>
                <div className='container'>
                    <Title level='1'>My Lists</Title>
                </div>
                <div className='container'>
                    <p className="text-content">
                        Your, research, and voting lists.
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
