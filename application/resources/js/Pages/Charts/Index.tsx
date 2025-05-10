import Title from '@/Components/atoms/Title';
import { Head, router } from '@inertiajs/react';
import ModalNavLink from '@/Components/ModalNavLink';
import { useLocalizedRoute } from '@/utils/localizedRoute';

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
                <ModalNavLink
                    href={useLocalizedRoute('proposals.charts.detail')}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                    Open Chart Details Modal
                </ModalNavLink>
            </div>
        </>
    );
};

export default Index;
