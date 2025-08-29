import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import GlobalMap from '@/Components/GlobalMap';
import NetworkLink from '@/Components/NetworkLink';
import GitHubIcon from '@/Components/svgs/GithubIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import LocationIcon from '@/Components/svgs/LocationIcon';
import SuccessBadge from '@/Components/svgs/SuccessBadge';
import { MapProvider } from '@/Context/MapContext';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

type Category = { id: string; name: string };
type Location = { id: string; city: string; country: string };

interface User {
    name: string;
    hero_img_url?: string;
    bio?: string;
}

type effective_details = {
    website?: string;
    github?: string;
    linkedin?: string;
    location?: string;
};

type Service = {
    id: string;
    title: string;
    description: string;
    categories?: Category[];
    header_image_url?: string;
    locations?: Location[];
    user?: User;
    effective_details?: effective_details;
};

interface ShowProps {
    service: Service;
}

type Point = {
    lat: number;
    lng: number;
    label: string;
    icon: string;
};

export default function Show({ service }: ShowProps) {
    const [points, setPoints] = useState<Point[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        async function fetchCoordinates() {
            if (!service.locations?.length) return;

            const resolvedPoints = await Promise.all(
                service.locations.map(async (loc) => {
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
                            lat: coords[1],
                            lng: coords[0],
                            label: `${loc.city}, ${loc.country}`,
                            icon: 'https://cdn-icons-png.flaticon.com/128/684/684908.png',
                        };
                    }
                    return null;
                }),
            );

            setPoints(resolvedPoints.filter(Boolean) as Point[]);
        }
        fetchCoordinates();
    }, [service.locations]);

    const formatUrl = (url: string) => {
        try {
            const hostname = new URL(url).hostname.replace(/^www\./, '');
            const name = hostname.split('.')[0];
            return name.charAt(0).toUpperCase() + name.slice(1);
        } catch {
            return url;
        }
    };

    return (
        <div className="flex flex-col gap-8 border-b border-gray-300 bg-gray-100 px-4 py-5 text-slate-600 sm:flex-row sm:gap-12 sm:px-8 sm:pt-12 sm:pb-10">
            <div className="flex flex-col sm:sticky sm:top-4 sm:max-w-80 sm:self-start">
                <div className="flex flex-row items-center pb-4">
                    <img
                        src={service.user?.hero_img_url ?? ''}
                        className="h-15 w-15 rounded-full border border-white opacity-100"
                        alt={service.user?.name ?? 'User Image'}
                    />
                    <Title
                        level="1"
                        className="w-36 flex-wrap pl-4 text-xl leading-6 font-semibold tracking-tight text-slate-900"
                    >
                        {service.user?.name ?? 'Unknown User'}
                    </Title>
                    <SuccessBadge />
                </div>

                <Paragraph size="sm" className="pb-6 font-normal">
                    {service.user?.bio ?? 'No bio available.'}
                </Paragraph>

                <div>
                    <Title
                        level="2"
                        className="pb-4 text-base font-semibold text-slate-900"
                    >
                        Services
                    </Title>
                    <div className="flex flex-wrap gap-1.5 pb-6">
                        {service.categories?.map((category) => (
                            <span
                                key={category.id}
                                className="rounded border border-slate-300 p-2 text-xs leading-3 font-medium text-slate-500"
                            >
                                {category.name}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col">
                        <Title
                            level="2"
                            className="pb-4 text-base font-semibold text-slate-900"
                        >
                            Networks
                        </Title>
                        <ul className="space-y-2 sm:space-y-2.5">
                            {service.effective_details?.website && (
                                <NetworkLink
                                    icon={<Globe />}
                                    url={service.effective_details.website}
                                    formatUrl={formatUrl}
                                />
                            )}
                            {service.effective_details?.github && (
                                <NetworkLink
                                    icon={<GitHubIcon />}
                                    url={service.effective_details.github}
                                    formatUrl={formatUrl}
                                />
                            )}
                            {service.effective_details?.linkedin && (
                                <NetworkLink
                                    icon={<LinkedInIcon />}
                                    url={service.effective_details.linkedin}
                                    formatUrl={formatUrl}
                                />
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {service.header_image_url && (
                    <img
                        src={service.header_image_url}
                        alt={service.title}
                        className="mb-6 h-48 w-full max-w-full rounded-lg object-cover sm:mb-7 sm:h-104"
                    />
                )}

                <Title
                    level="2"
                    className="mb-4 text-base font-semibold text-slate-900"
                >
                    {service.title}
                </Title>

                {service.description && (
                    <Paragraph
                        size="sm"
                        className="mb-6 font-normal break-words sm:mb-7"
                    >
                        {service.description}
                    </Paragraph>
                )}

                <div className="gap-5">
                    <Title className="mb-5 text-base font-semibold text-slate-900">
                        Get in touch
                    </Title>
                    <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="h-52 w-full sm:w-84">
                            {isClient && points.length > 0 ? (
                                <MapProvider
                                    customConfig={{
                                        config: {
                                            initialViewState: {
                                                latitude: points[0].lat,
                                                longitude: points[0].lng,
                                                zoom: 10,
                                            },
                                        },
                                    }}
                                >
                                    <GlobalMap points={points} />
                                </MapProvider>
                            ) : (
                                <p>Loading map...</p>
                            )}
                        </div>

                        <div className="mb-5 w-full sm:flex-1 sm:pt-11">
                            <ul className="space-y-2">
                                {service.effective_details?.website && (
                                    <NetworkLink
                                        icon={<Globe />}
                                        url={service.effective_details.website}
                                        formatUrl={formatUrl}
                                    />
                                )}
                                {service.effective_details?.github && (
                                    <NetworkLink
                                        icon={<GitHubIcon />}
                                        url={service.effective_details.github}
                                        formatUrl={formatUrl}
                                    />
                                )}
                                {service.effective_details?.linkedin && (
                                    <NetworkLink
                                        icon={<LinkedInIcon />}
                                        url={service.effective_details.linkedin}
                                        formatUrl={formatUrl}
                                    />
                                )}
                                {service.effective_details?.location && (
                                    <NetworkLink
                                        icon={<LocationIcon />}
                                        label={
                                            service.effective_details.location
                                        }
                                    />
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
