interface PercentageProgressBarPageProps extends Record<string, unknown> {
    value: number;
    total: number;
    primaryBackgroundColor: string;
    secondaryBackgroudColor: string;
}

const PercentageProgressBar: React.FC<PercentageProgressBarPageProps> = ({
    value,
    total,
    primaryBackgroundColor,
    secondaryBackgroudColor
}) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className={`${primaryBackgroundColor} h-4 w-full overflow-hidden rounded-md`}>
                <div
                    className={`${secondaryBackgroudColor} h-4 rounded-md transition-all duration-500 ease-in-out`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default PercentageProgressBar;
