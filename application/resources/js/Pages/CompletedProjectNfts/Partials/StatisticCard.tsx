
interface StatisticCardProps {
    value: string | number;
    description: string;
    icon: React.ReactNode;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ value, description, icon }) => (
    <div className="bg-background shadow rounded-lg p-4 sm:p-6 flex items-center justify-start gap-4">
        <div className="h-12 w-12 rounded-full flex items-center justify-center">
            {icon}
        </div>
        <div className="flex flex-col min-w-0">
            <p className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{value}</p>
            <p className="text-sm sm:text-base lg:text-lg">{description}</p>
        </div>
    </div>
);

export default StatisticCard;
