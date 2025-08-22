import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import NetworkLinks from '@/Components/NetworkLinks';
import SuccessBadge from '@/Components/svgs/SuccessBadge';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import ServiceMap from './Partials/ServiceMap';

interface Category {
    id: number | string;
    name: string;
    slug?: string;
}

interface Location {
    id: string;
    city: string;
}

interface ServiceData {
    id: number | string;
    title: string;
    description: string;
    header_image_url?: string;
    categories?: Category[];
    locations?: Location[];
    user?: {
        hero_img_url?: string;
    };
    effective_details?: {
        name?: string | null;
        bio?: string;
        email?: string;
        website?: string;
        github?: string;
        linkedin?: string;
    };
}

interface ServicesShowProps {
    service: ServiceData;
}

const ServicesShow: React.FC<ServicesShowProps> = ({ service }) => {
    const { t } = useLaravelReactI18n();

    const details = service.effective_details ?? {};

    const formatUrl = (url: string) => {
        try {
            const hostname = new URL(url).hostname.replace(/^www\./, '');

            return hostname.split('.')[0];
        } catch {
            const fallback = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
            return fallback.split('.')[0];
        }
    };

    return (
        <div className="text-content-lighter max-w-6xl border-b bg-gray-50 p-2.5 text-slate-500">
            <div className="flex flex-col gap-12 lg:flex-row">
                <div className="flex w-full flex-shrink-0 flex-col gap-6 lg:w-80">
                    <div className="inline-flex items-center gap-4">
                        {service.user?.hero_img_url && (
                            <img
                                src={service.user.hero_img_url}
                                alt={service.title}
                                className="h-15 w-15 rounded-full border object-cover"
                            />
                        )}
                        {details.name && (
                            <Title
                                level="2"
                                className="text-xl leading-6 font-semibold tracking-tight text-slate-900"
                            >
                                {details.name}
                            </Title>
                        )}
                        <SuccessBadge />
                    </div>

                    <Paragraph size="md">
                        {details.bio || 'No bio available'}
                    </Paragraph>

                    {service.categories?.length ? (
                        <div>
                            <Title
                                level="5"
                                className="text-base leading-4 font-semibold text-gray-900"
                            >
                                Services
                            </Title>
                            <ul className="font-inter mt-2 flex flex-wrap gap-2">
                                {service.categories.map((cat) => (
                                    <li
                                        key={cat.id}
                                        className="flex items-center justify-center rounded border border-gray-300 p-2 text-xs font-medium text-slate-600"
                                    >
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <div>
                        <Title
                            level="5"
                            className="mb-2 text-base leading-4 font-semibold text-slate-900"
                        >
                            Network
                        </Title>
                        <NetworkLinks
                            website={details.website}
                            github={details.github}
                            linkedin={details.linkedin}
                            formatUrl={formatUrl}
                            variant="default"
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col gap-7">
                    <div className="rounded-lg">
                        <img
                            src={service.header_image_url}
                            alt={service.title}
                            className="h-96 w-full object-cover p-2"
                        />
                    </div>
                    <div>
                        <Title
                            level="2"
                            className="mb-4 text-xl leading-4 font-semibold text-slate-900"
                        >
                            {service.title}
                        </Title>
                        <Paragraph size="md" className="leading-6 font-normal">
                            {service.description}
                        </Paragraph>
                    </div>

                    <div className="gap-5">
                        <Title className="mb-5 text-xl leading-4 font-semibold text-slate-900">
                            Get in touch
                        </Title>
                        <div className="flex flex-col flex-wrap gap-5 md:flex-row md:flex-wrap">
                            <div className="h-52 w-full md:w-84">
                                {service.locations?.length ? (
                                    <ServiceMap
                                        cities={service.locations.map(
                                            (loc) => loc.city,
                                        )}
                                    />
                                ) : (
                                    <div>No locations available</div>
                                )}
                            </div>

                            <div className="w-full md:flex-1 lg:pt-11">
                                <NetworkLinks
                                    website={details.website}
                                    github={details.github}
                                    linkedin={details.linkedin}
                                    location={service.locations?.[0]?.city}
                                    formatUrl={formatUrl}
                                    variant="default"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicesShow;
