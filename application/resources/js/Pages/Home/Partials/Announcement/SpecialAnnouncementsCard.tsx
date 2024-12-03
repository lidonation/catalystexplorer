const SpecialAnnouncementCard = ({ announcement }: any) => {
    return (
        <div className="flex flex-col lg:flex-row items-center p-6 w-full">
            <div className="flex flex-col flex-1 lg:mr-12 text-center lg:text-left">
                <h2 className="title-2 font-bold mb-4">
                    {announcement.title}
                </h2>

                <p className="mb-6 leading-relaxed">
                    {announcement.content}
                </p>

                <div className="flex flex-col lg:flex-row justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-4 lg:mt-8">
                    {/* Handle single or multiple CTAs */}
                    {Array.isArray(announcement.cta?.link) && Array.isArray(announcement.cta?.label)
                        ? announcement.cta.link.map((link: string, index: number) => (
                            <a
                                key={index}
                                href={link}
                                className={`flex-1 px-6 py-3 rounded-md shadow-md transition text-center ${index === 0
                                    ? 'bg-primary hover:bg-background'
                                    : 'border border-gray-300 hover:bg-pr' 
                                    }`}
                            >
                                {announcement.cta.label[index]}
                            </a>
                        ))
                        : typeof announcement.cta?.link === 'string' && typeof announcement.cta?.label === 'string' && (
                            <a
                                href={announcement.cta.link}
                                className="flex-1 bg-primary px-6 py-3 rounded-md shadow-md hover:bg-background transition text-center"
                            >
                                {announcement.cta.label}
                            </a>
                        )}
                </div>
            </div>

            {/* Image Section */}
            <div className="flex-shrink-0 w-full h-auto lg:w-[40%] mt-6 lg:mt-0 lg:ml-8">
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
