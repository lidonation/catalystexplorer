import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Title from '@/Components/atoms/Title';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;
import ConnectionData = App.DataTransferObjects.ConnectionData;
import Graph from '../../Components/Graph';
import IdeascaleProfileCard from './Partials/IdeascaleProfileCard';
import RecordsNotFound from '@/Layouts/RecordsNotFound';

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfile: IdeascaleProfilesData | null;
    connections: ConnectionData | null;
}

const IdeascaleProfile = ({
    ideascaleProfile,
    connections
}: PageProps<IdeascaleProfilesPageProps>) => {
    const { t } = useTranslation();

    return (
        <>
            <Head title={ideascaleProfile?.name || t('profileNotFound')} />

            <div className="relative flex w-full flex-col justify-center gap-8">
                <section className="container py-8">
                    {ideascaleProfile ? (
                        <IdeascaleProfileCard ideascaleProfile={ideascaleProfile} />
                    ) : (
                        <RecordsNotFound context="profiles" />
                    )}
                </section>

                <section className="container py-8">
                    {ideascaleProfile ? (
                        <>
                            <h4 className="title-4">{t('comingSoon')}</h4>
                            <div>{JSON.stringify(ideascaleProfile)}</div>
                        </>
                    ) : (
                        <RecordsNotFound context="profiles" />
                    )}
                </section>
            </div>

            <WhenVisible
                data="connections"
                fallback={<div>Loading Connections</div>}
            >
                <div className="w-full px-8 ">
                    <Title level="2">Connections</Title>

                    {connections && Object.keys(connections).length > 0 ? (
                        <div className="w-full">
                            <Graph graphData={connections} />
                        </div>
                    ) : (
                        <RecordsNotFound context="connections" />
                    )}
                </div>
            </WhenVisible>
        </>
    );
};

export default IdeascaleProfile;
