interface StatisticCardProps {
    value: string | number;
    description: string;
    icon: React.ReactNode;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ value, description, icon }) => (
    <div className="bg-background flex items-center justify-start gap-4 rounded-lg p-4 shadow-sm sm:p-6">
        {/* Icon Container */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
            {icon}
        </div>

        {/* Text Container */}
        <div className="flex flex-col justify-center gap-2">
            <p className="text-lg font-bold">{value}</p>
            <div className="flex min-h-[2rem] items-start text-lg leading-5">
                <p>{description}</p>
            </div>
        </div>
    </div>
);

export default StatisticCard;
