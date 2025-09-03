interface StatisticCardProps {
    value: string | number;
    description: string;
    icon: React.ReactNode;
}

const StatisticCard: React.FC<StatisticCardProps> = ({
    value,
    description,
    icon,
}) => (
    <div className="bg-background mx-auto flex w-full max-w-xs items-center justify-start gap-4 rounded-2xl p-4 shadow-sm sm:max-w-sm sm:p-5 lg:max-w-full">
        <div className="bg-background-lighter flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl">
            {icon}
        </div>

        <div className="flex flex-col justify-center gap-1">
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-base leading-tight font-semibold">
                {description}
            </p>
        </div>
    </div>
);

export default StatisticCard;
