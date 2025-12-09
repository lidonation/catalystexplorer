import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import ClientOnly from '@/Components/ClientOnly';
import RichContent from '@/Components/RichContent';
import VerifyBadge from '@/Components/svgs/VerifyBadge';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { Head, usePage } from '@inertiajs/react';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { ServiceWorkflowParams } from '@/enums/service-workflow-params';
import Markdown from 'marked-react';
import { Suspense, lazy, useEffect, useState } from 'react';
import GroupSocials from '../Groups/Partials/GroupSocials';
import ServiceData = App.DataTransferObjects.ServiceData;
import { useLaravelReactI18n } from 'laravel-react-i18n';

// Dynamic import with lazy loading for GlobalMap (lib does not have SSR support)
const GlobalMap = lazy(() => import('@/Components/GlobalMap'));

interface EffectiveDetails {
    github?: string;
    linkedin?: string;
    website?: string;
}

interface ShowProps {
    service: ServiceData & {
        effective_details?: EffectiveDetails;
    };
}

interface User {
    name: string;
    hero_img_url?: string;
    bio?: string;
}

type Point = {
    id: number;
    latitude: number;
    longitude: number;
    title: string;
    description?: string;
};

export default function Show({ service }: ShowProps) {
    const [points, setPoints] = useState<Point[]>([]);
    const {t} = useLaravelReactI18n();
    const page = usePage();
    const user = page.props?.auth?.user;

    const socialGroup = {
        id: service.id ?? 'service-' + Math.random().toString(36).substr(2, 9),
        github: service.effective_details?.github ?? '',
        linkedin: service.effective_details?.linkedin ?? '',
        website: service.effective_details?.website ?? '',
        twitter: '',
        discord: '',
        location: service.locations?.length
            ? [service.locations[0].city, service.locations[0].country]
                  .filter(Boolean)
                  .join(', ')
            : '',
    };

    useEffect(() => {
        async function fetchCoordinates() {
            if (!service.locations?.length) return;

            const resolvedPoints = await Promise.all(
                service.locations.map(async (loc, index) => {
                    const query = encodeURIComponent(
                        `${loc.city}, ${loc.country}`,
                    );
                    const res = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${
                            import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
                        }`,
                    );
                    const data = await res.json();

                    if (data?.features?.length > 0) {
                        const coords = data.features[0].geometry.coordinates;

                        return {
                            id: index + 1,
                            latitude: coords[1],
                            longitude: coords[0],
                            title: `${loc.city}, ${loc.country}`,
                            description: `Service location in ${loc.city}`,
                        };
                    }
                    return null;
                }),
            );

            setPoints(resolvedPoints.filter(Boolean) as Point[]);
        }
        fetchCoordinates();
    }, [service.locations]);

    return (
        <div className="text-content flex flex-col gap-8 border-b border-gray-300 px-4 py-5 text-slate-500 sm:flex-row sm:gap-12 sm:px-8 sm:pt-12 sm:pb-10">
            <Head title={'Services page'} />
            <div className="flex flex-col sm:sticky sm:top-4 sm:max-w-80 sm:self-start">
                <div className="flex flex-row items-center gap-4 pb-4">
                    <img
                        src={service.user?.hero_img_url ?? ''}
                        className="h-15 w-15 rounded-full border border-white opacity-100"
                        alt={service.user?.name ?? 'User Image'}
                    />
                    <div className="flex max-w-44 items-center justify-between gap-2">
                        <Title
                            className="text-content text-xl leading-6 font-semibold tracking-tight"
                            data-testid="services-page-title"
                        >
                            {service.user?.name ?? t('services.unknownUser')}
                        </Title>
                        <VerifyBadge />
                    </div>
                </div>

                <div className="text-md pb-6 font-normal">
                    <Markdown>
                        {String(
                            (service.user as User)?.bio ?? t('services.noBioAvailable'),
                        )}
                    </Markdown>
                </div>

                <div>
                    <Title
                        level="2"
                        className="text-content pb-4 text-base leading-none font-semibold"
                    >
                        {t('services.services')}
                    </Title>
                    <div className="flex min-h-[28px] flex-wrap items-start justify-start gap-1.5 self-stretch pb-6">
                        {service.categories?.map((category) => (
                            <div
                                key={category.id}
                                className="bg-background-lighter border-border-secondary inline-flex max-w-full flex-shrink-0 items-center rounded border p-2"
                                title={category.name}
                            >
                                <RichContent
                                    className="text-foreground-secondary text-xs leading-3 font-medium"
                                    content={category?.name}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col">
                        <Title
                            level="2"
                            className="text-content pb-4 text-base leading-none font-semibold"
                        >
                            {t('services.networks')}
                        </Title>
                        <GroupSocials
                            iconContainerClass="flex flex-col gap-2.5 "
                            group={socialGroup}
                            showLink={true}
                        />
                    </div>
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {user && service.user?.id === user.id && (
                    <div className="mb-4 flex justify-end">
                        <PrimaryLink
                            href={generateLocalizedRoute('workflows.createService.index', {
                                [ServiceWorkflowParams.STEP]: 1,
                                [ServiceWorkflowParams.SERVICE_HASH]: service.id,
                                [ServiceWorkflowParams.EDIT]: true
                            })}
                            className="text-xs px-3 py-2 hover:bg-primary/[0.4] text-white rounded-md transition-colors"
                        >
                            {t('workflows.createService.editService')}
                        </PrimaryLink>
                    </div>
                )}
                
                <Card className="flex min-w-0 flex-1 flex-col bg-background">
                {service.header_image_url && (
                    <img
                        src={service.header_image_url}
                        alt={service.title}
                        className="mb-6 h-48 w-full max-w-full rounded-lg object-cover sm:mb-7 sm:h-104"
                    />
                )}

                <Title
                    className="text-content pb-4 text-xl leading-4 font-semibold"
                    data-testid="services-show-title"
                >
                    {service.title}
                </Title>

                {service.description && (
                    <div className="mb-6 text-base leading-6 font-normal tracking-normal break-words sm:mb-7">
                        <Markdown>{String(service.description ?? '')}</Markdown>
                    </div>
                )}

                <div className="gap-5">
                    <Title className="text-content mb-5 text-xl leading-4 font-semibold">
                        {t('services.getInTouch')}
                    </Title>
                    <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="h-52 w-full sm:w-84">
                            {points.length > 0 ? (
                                <ClientOnly
                                    fallback={
                                        <div className="flex h-52 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                           {t('services.mapLoadingOnClient')}
                                        </div>
                                    }
                                >
                                    <Suspense
                                        fallback={
                                            <div className="flex h-52 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                                {t('services.loadingMap')}
                                            </div>
                                        }
                                    >
                                        <GlobalMap
                                            points={points}
                                            initialZoom={10}
                                            height="208px"
                                            width="100%"
                                        />
                                    </Suspense>
                                </ClientOnly>
                            ) : (
                                <div className="flex h-52 w-full items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                    {t('services.noLocationsAvailable')}
                                </div>
                            )}
                        </div>

                        <div className="mb-5 w-full sm:flex-1 sm:pt-11">
                            <GroupSocials
                                group={socialGroup}
                                iconContainerClass="flex flex-col gap-2.5"
                                showLink={true}
                                showLocation={true}
                            />
                        </div>
                    </div>
                </div>
            </Card>
            </div>
        </div>
    );
}
