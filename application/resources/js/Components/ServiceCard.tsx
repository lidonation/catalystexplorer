import PrimaryLink from './atoms/PrimaryLink';
import ServiceData = App.DataTransferObjects.ServiceData;

export default function ServiceCard({ service }: { service: ServiceData }) {
    const statusBadgeClasses = {
        offered: 'bg-green-500',
        needed: 'bg-orange-400',
    };

    const badgeType =
        service.type.toLowerCase() === 'offered' ? 'offered' : 'needed';
    const visibleCategories = service.categories?.slice(0, 2) || [];
    const extraCategoriesCount = Math.max(
        0,
        (service.categories?.length || 0) - 2,
    );

    const truncateText = (text: string, maxLength: number = 15) => {
        return text.length > maxLength
            ? `${text.substring(0, maxLength)}...`
            : text;
    };

    return (
        <PrimaryLink href={`/services/${service.id}`} className="no-underline">
            <div
                className="bg-background flex-1 flex-col items-start justify-start overflow-hidden rounded-xl border-gray-200 shadow-xs"
                data-testid="service-card"
            >
                <div
                    className="relative h-40 self-stretch overflow-hidden"
                    data-testid="service-card-image-container"
                >
                    <img
                        src={
                            service.header_image_url ||
                            '/images/default-service-header.jpg'
                        }
                        alt={service.title}
                        className="h-full w-full"
                    />
                    <div className="absolute inset-0 flex flex-col items-end justify-start p-2.5">
                        <div
                            className={`rounded-[30px] p-2 ${statusBadgeClasses[badgeType]} inline-flex items-center justify-center`}
                            data-property-1={service.type}
                        >
                            <div
                                className="justify-start text-xs leading-3 font-medium text-white"
                                data-testid="service-card-status-badge"
                            >
                                {service.type === 'offered'
                                    ? 'Offering Service'
                                    : 'Requesting Service'}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="flex flex-col items-start justify-start gap-5 self-stretch p-3.5"
                    data-testid="service-card-content"
                >
                    <div className="bg-card flex flex-col items-start justify-center gap-3 self-stretch">
                        <div
                            className="text-content justify-start self-stretch text-xl leading-normal font-medium"
                            data-testid="service-card-title"
                        >
                            {service.title}
                        </div>
                        <div className="justify-start text-sm leading-none font-normal text-slate-500">
                            {service.name ||
                                service.user?.name ||
                                'Unknown Provider'}
                        </div>
                    </div>

                    {service.categories && service.categories.length > 0 && (
                        <div className="flex min-h-[28px] flex-wrap items-start justify-start gap-1.5 self-stretch">
                            {visibleCategories.map(
                                (category: { name: string }, index: number) => (
                                    <div
                                        key={index}
                                        className="bg-background-lighter border-border-secondary inline-flex max-w-full flex-shrink-0 items-center rounded-lg border px-2.5 py-1"
                                        title={category.name}
                                    >
                                        <div className="truncate text-xs leading-3 font-medium text-slate-500">
                                            {truncateText(category.name)}
                                        </div>
                                    </div>
                                ),
                            )}
                            {extraCategoriesCount > 0 && (
                                <div className="bg-background-lighter border-border-secondary inline-flex flex-shrink-0 items-center rounded-lg border px-2.5 py-1">
                                    <div className="text-xs leading-3 font-medium text-slate-500">
                                        +{extraCategoriesCount}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PrimaryLink>
    );
}
