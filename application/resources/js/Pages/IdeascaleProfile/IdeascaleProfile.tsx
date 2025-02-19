import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Title from '@/Components/atoms/Title';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;
import ConnectionData = App.DataTransferObjects.ConnectionData;
import Graph from '../../Components/Graph';
import IdeascaleProfileCard from './Partials/IdeascaleProfileCard';

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfile: IdeascaleProfilesData;
    connections: ConnectionData;
}

const IdeascaleProfile = ({
    ideascaleProfile,
    connections
}: PageProps<IdeascaleProfilesPageProps>) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={ideascaleProfile.name} />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <section className="container py-8">
                    <IdeascaleProfileCard ideascaleProfile={ideascaleProfile} />
                </section>


                <section className="container py-8">
                    <h4 className="title-4">{t('comingSoon')}</h4>
                    <div>{JSON.stringify(ideascaleProfile)}</div>
                </section>
            </div>

            <WhenVisible
                data="connections"
                fallback={<div>Loading Connections</div>}
            >
                <div className="w-full px-8 ">
                    <Title level="2">Connections</Title>

                    {typeof connections !== 'undefined' && (
                        <div className="w-full">
                            <Graph graphData={connections} />
                        </div>
                    )}
                </div>
            </WhenVisible>
        </>
    );
};

export default IdeascaleProfile;
