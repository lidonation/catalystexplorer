import FundData = App.DataTransferObjects.FundData;

interface HeroSectionProps extends Record<string, unknown> {
    fund: FundData;
}

const HeroSection: React.FC<HeroSectionProps> = ({ fund }) => {
    return (
        <section className="container py-8">
            <div
                className="relative flex h-60 w-full items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-gray-100 to-gray-900">
                <img
                    src={fund.hero_img_url}
                    alt={fund.title || 'Fund'}
                    className="h-full w-full object-cover"
                />
            </div>
            <div
                className="absolute left-14 top-48 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-8 border-background-lighter bg-linear-to-r from-gray-100 to-gray-900 shadow-xs sm:h-32 sm:w-32 lg:h-36 lg:w-36">
                <img
                    src={fund.hero_img_url}
                    alt={fund.title || 'Fund'}
                    className="h-full w-full object-cover"
                />
            </div>
        </section>
    );
};

export default HeroSection;
