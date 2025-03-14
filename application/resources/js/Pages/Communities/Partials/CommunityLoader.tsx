export default function CommunityLoader() {
    const campaignCards = Array.from({ length: 6 }, (_, index) => index + 1);
    return (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {campaignCards.map((index) => (
                <div key={index} className="flex gap-2">
                    <p className="mb-2 h-48 w-96 animate-pulse rounded-sm bg-gray-200" />
                </div>
            ))}
        </div>
    );
}
