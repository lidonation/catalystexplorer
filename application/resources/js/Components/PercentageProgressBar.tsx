interface PercentageProgressBarPageProps extends Record<string, unknown> {
    value: number;
    total: number;
}

const PercentageProgressBar: React.FC<PercentageProgressBarPageProps> = ({
    value,
    total,
}) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="bg-background h-4 w-full overflow-hidden rounded-md">
                <div
                    className="bg-primary h-4 rounded-md transition-all duration-500 ease-in-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default PercentageProgressBar;
