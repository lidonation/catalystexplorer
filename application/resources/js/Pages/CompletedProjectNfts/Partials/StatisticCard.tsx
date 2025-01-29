interface StatisticCardProps {
    value: string | number;
    description: string;
    icon: React.ReactNode;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ value, description, icon }) => (
    <div className="bg-background shadow-sm rounded-lg p-4 sm:p-6 flex items-center justify-start gap-4">
        {/* Icon Container */}
        <div className="h-12 w-12 rounded-full shrink-0 flex items-center justify-center">
            {icon}
        </div>

        {/* Text Container */}
        <div className="flex flex-col justify-center gap-2">
            <p className="text-lg font-bold">{value}</p>
            <div className="text-lg leading-5 min-h-[2rem] flex items-start">
                <p>{description}</p>
            </div>
        </div>
    </div>
);

export default StatisticCard;
