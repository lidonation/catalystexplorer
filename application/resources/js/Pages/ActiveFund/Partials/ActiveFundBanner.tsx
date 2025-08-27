import FundData = App.DataTransferObjects.FundData;

interface ActiveFundBannerProps extends Record<string, unknown> {
    fund: FundData;
}

const ActiveFundBanner: React.FC<ActiveFundBannerProps> = ({ fund }) => {
    return (
        <section className="container py-8">
            <div
                className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-linear-to-r from-gray-100 to-gray-900">
                <img
                    src={fund.banner_img_url}
                    alt={fund.title || 'Fund'}
                    className="h-full w-full object-cover"
                />
            </div>
        </section>
    );
};

export default ActiveFundBanner;
