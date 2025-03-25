import Title from '@/Components/atoms/Title';
import { Head } from '@inertiajs/react';
import Paragraph from '@/Components/atoms/Paragraph';
import { useTranslation } from 'react-i18next';
import RecordsNotFound from '@/Layouts/RecordsNotFound';

const Index = () => {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Catalyst Votes"/>

            <header>
                <div className='container'>
                    <Title>Catalyst Votes</Title>
                    <Paragraph children="View onchain (jormugandr) transactions of votes cast" className='text-'/>
                </div>
               
            </header>

            <div className="flex h-screen w- p-50 flex-col items-center justify-center">
                <RecordsNotFound/>
            </div>
        </>
    );
};

export default Index;
