import Paginator from '@/Components/Paginator';
import Title from '@/Components/atoms/Title';
import {FiltersProvider} from '@/Context/FiltersContext';
import {ListProvider} from '@/Context/ListContext';
import {Head, WhenVisible} from '@inertiajs/react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {PaginatedData} from '../../../types/paginated-data';
import {SearchParams} from '../../../types/search-params';
import CommunityData = App.DataTransferObjects.CommunityData;


interface CommunitiesPageProps extends Record<string, unknown> {
    communities: PaginatedData<CommunityData[]>;
    filters: SearchParams;
    filterCounts: {
        proposalsCount: number;
        totalAwardedAda: number;
        totalAwardedUsd: number;
    };
}

type FundsType = Record<string, number>;

const Index: React.FC<CommunitiesPageProps> = ({
                                                   communities,
                                                   filters,
                                                   filterCounts,
                                               }) => {
    const [showFilters, setShowFilters] = useState(false);
    const {t} = useTranslation();
    const [funds, setFunds] = useState<FundsType>({});

    useEffect(() => {
        const fetchFunds = async () => {
            try {
                const response = await axios.get(route('api.fundCounts'));
                setFunds(response.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchFunds().then();
    }, []);

    return (
        <>
            <ListProvider>
                <Head title="Communities"/>

                <header>
                    <div className="container py-2">
                        <Title level="1">{t('Communities.title')}</Title>
                        <p className="text-content">
                            {t('Communities.subtitle')}
                        </p>
                    </div>
                </header>

                <section
                    className='container flex w-full flex-col items-center justify-center overflow-hidden duration-500 ease-in-out'
                >
                    {JSON.stringify(communities)} show me the data
                </section>
            </ListProvider>
        </>
    );
};

export default Index;
