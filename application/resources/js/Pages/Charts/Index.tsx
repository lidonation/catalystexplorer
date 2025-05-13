import Title from '@/Components/atoms/Title';
import { Head, router } from '@inertiajs/react';
import ModalLayout from '@/Layouts/ModalLayout';

const Index = () => {
    function handleChartDetailModalClose() {
            router.reload({ only: ['proposals'] });
    }

    return (
        <ModalLayout onModalClosed={handleChartDetailModalClose}>
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
        </ModalLayout>
    );
};

export default Index;
