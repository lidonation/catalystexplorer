import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import NetworkLink from '@/Components/NetworkLink';
import GitHubIcon from '@/Components/svgs/GithubIcon';
import LinkedInIcon from '@/Components/svgs/LinkedInIcons';
import LocationIcon from '@/Components/svgs/LocationIcon';
import SuccessBadge from '@/Components/svgs/SuccessBadge';
import { Globe } from 'lucide-react';
import ServiceMap from './Partials/ServiceMap';

type Category = {
    id: string;
    name: string;
    slug: string;
    hash: string;
};
type Location = {
    id: string;
    city: string;
    country: string;
};
interface User {
    id: string;
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

export default function Show({ service }: ShowProps) {
    const formatUrl = (url: string) => {
        try {
            const hostname = new URL(url).hostname.replace(/^www\./, '');
            const name = hostname.split('.')[0];
            return name.charAt(0).toUpperCase() + name.slice(1);
        } catch {
            return url;
        }
    };

    console.log(service);
    return (
        <div className="pt:5 flex flex-col gap-8 border-b border-gray-300 bg-gray-100 px-4 text-slate-600 md:flex-row md:flex-wrap md:gap-12 md:px-8 md:pt-12">
            <div className="sticky flex flex-shrink-0 flex-col md:w-80">
                <div className="top-0 flex flex-row items-center pb-4">
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
                <Paragraph size="md" className="pb-6 font-normal">
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
                        <ul className="space-y-2 md:space-y-2.5">
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

            <div className="flex flex-1 shrink-0 flex-col">
                {service.header_image_url && (
                    <img
                        src={service.header_image_url}
                        alt={service.title}
                        className="mb-6 h-48 w-full rounded-lg object-cover md:mb-7 md:h-104"
                    />
                )}

                <Title
                    level="2"
                    className="mb-4 text-base font-semibold text-slate-900"
                >
                    {service.title}
                </Title>

                {service.description && (
                    <Paragraph size="md" className="mb-6 font-normal md:mb-7">
                        {service.description}
                    </Paragraph>
                )}
                <div className="gap-5">
                    <Title className="mb-5 text-base font-semibold text-slate-900">
                        Get in touch
                    </Title>
                    <div className="flex flex-col flex-wrap gap-5 sm:flex-row sm:flex-wrap">
                        <div className="h-52 w-full sm:w-84">
                            {service.locations?.length ? (
                                <ServiceMap
                                    cities={
                                        service.locations.map(
                                            (loc) => loc.city,
                                        ) ?? []
                                    }
                                />
                            ) : null}
                        </div>

                        <div className="mb-5 w-full sm:flex-1 sm:pt-11 md:pt-11">
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
