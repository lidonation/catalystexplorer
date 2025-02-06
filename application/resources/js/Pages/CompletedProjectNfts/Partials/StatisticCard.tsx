interface StatisticCardProps {
    value: string | number;
    description: string;
    icon: React.ReactNode;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ value, description, icon }) => (
    <div className="flex items-center justify-start w-full max-w-xs gap-4 p-4 mx-auto shadow-sm rounded-2xl bg-background sm:p-5 sm:max-w-sm lg:max-w-full">
        <div className="flex items-center justify-center w-16 h-16 bg-background-lighter shrink-0 rounded-3xl">
            {icon}
        </div>

        <div className="flex flex-col justify-center gap-1">
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-base font-semibold leading-tight">{description}</p>
        </div>
    </div>
);

export default StatisticCard;
