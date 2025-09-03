import Title from '@/Components/atoms/Title';

type CtaItem = Record<string, unknown>;

const SpecialAnnouncementCard = ({ announcement }: any) => {
    return (
        <div
            className="flex w-full flex-col items-center p-6 lg:flex-row"
            data-testid={`special-announcement-card-${announcement.id}`}
        >
            <div className="flex flex-1 flex-col text-center lg:mr-12 lg:text-left">
                <Title
                    className="mb-4 font-bold"
                    data-testid="special-announcement-card-title"
                >
                    {announcement.title}
                </Title>

                <p
                    className="mb-6 leading-relaxed"
                    data-testid="special-announcement-card-content"
                >
                    {announcement.content}
                </p>

                <div className="flex flex-col justify-center space-y-4 lg:mt-8 lg:flex-row lg:justify-start lg:space-y-0 lg:space-x-4">
                    {/* Handle multiple CTAs */}
                    {Array.isArray(announcement.cta) &&
                    announcement.cta.length > 0 ? (
                        Object.entries(announcement?.cta ?? {}).map(
                            (cta, index) => {
                                return (
                                    <a
                                        key={cta[0]}
                                        href={cta[1] as string}
                                        className={`flex-1 rounded-md px-6 py-3 text-center shadow-md transition-colors duration-300 ${
                                            index === 0
                                                ? 'bg-primary hover:bg-background hover:text-primary'
                                                : 'hover:bg-primary border border-gray-300'
                                        }`}
                                        data-testid={`special-announcement-card-link-${cta[0]}`}
                                    >
                                        {index}
                                    </a>
                                );
                            },
                        )
                    ) : (
                        // Fallback for single CTA
                        <a
                            href={announcement.cta?.link}
                            className="bg-primary text hover:bg-background hover:text-primary flex-1 rounded-md px-6 py-3 shadow-md transition-colors duration-300"
                            data-testid={`special-announcement-card-link-${announcement.cta?.label}`}
                        >
                            {announcement.cta?.label}
                        </a>
                    )}
                </div>
            </div>

            {/* Image Section */}
            <div className="mt-6 h-auto w-full shrink-0 lg:mt-0 lg:ml-8 lg:w-[40%]">
                <img
                    src={announcement.hero_image_url}
                    alt={`${announcement.title} Hero Image`}
                    className="h-auto w-full rounded-lg"
                    data-testid="special-announcement-card-image"
                />
            </div>
        </div>
    );
};

export default SpecialAnnouncementCard;
