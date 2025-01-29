interface CtaItem {
    label: string;
    link: string;
    title: string;
}
const SpecialAnnouncementCard = ({ announcement }: any) => {
    return (
        <div className="flex flex-col lg:flex-row items-center p-6 w-full">
            <div className="flex flex-col flex-1 lg:mr-12 text-center lg:text-left">
                <h2 className="title-2 font-bold mb-4">{announcement.title}</h2>

                <p className="mb-6 leading-relaxed">{announcement.content}</p>

                <div className="flex flex-col lg:flex-row justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-4 lg:mt-8">
                    {/* Handle multiple CTAs */}
                    {Array.isArray(announcement.cta) && announcement.cta.length > 0 ? (
                        announcement.cta.map((cta: CtaItem, index: number) => (
                            <a
                                key={index}
                                href={cta.link}
                                className={`flex-1 px-6 py-3 rounded-md shadow-md text-center transition-colors duration-300 ${index === 0
                                    ? 'bg-primary hover:bg-background hover:text-primary'
                                    : 'border border-gray-300 hover:bg-primary'
                                    }`}
                            >
                                {cta.label}
                            </a>
                        ))
                    ) : (
                        // Fallback for single CTA
                        <a
                            href={announcement.cta?.link}
                            className="flex-1 bg-primary px-6 py-3 rounded-md shadow-md text hover:bg-background hover:text-primary transition-colors duration-300"
                        >
                            {announcement.cta?.label}
                        </a>
                    )}
                </div>
            </div>

            {/* Image Section */}
            <div className="shrink-0 w-full h-auto lg:w-[40%] mt-6 lg:mt-0 lg:ml-8">
                <img
                    src={announcement.hero_image_url}
                    alt={`${announcement.title} Hero Image`}
                    className="w-full h-auto rounded-lg"
                />
            </div>
        </div>
    );
};

export default SpecialAnnouncementCard;
