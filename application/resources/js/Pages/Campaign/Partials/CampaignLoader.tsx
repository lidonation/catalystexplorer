export default function CampaignLoader() {
    const campaignCards = Array.from({ length: 6 }, (_, index) => index + 1);
    return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaignCards.map((_, index) => (
                <div key={index}>
                    {' '}
                    <div className="h-60 w-full animate-pulse overflow-hidden rounded-lg bg-gray-200"></div>
                    <div className="pt-6">
                        <div className="mb-4 h-6 w-40 animate-pulse rounded-sm bg-gray-200" />
                        <p className="mb-4 h-24 w-full animate-pulse rounded-sm bg-gray-200" />
                        <div className="flex gap-2">
                            <p className="mb-2 h-8 w-32 animate-pulse rounded-sm bg-gray-200" />
                            <p className="mb-2 h-8 w-32 animate-pulse rounded-sm bg-gray-200" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
