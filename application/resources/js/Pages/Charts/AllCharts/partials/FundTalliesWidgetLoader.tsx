import Paragraph from '@/Components/atoms/Paragraph';

interface FundTalliesWidgetLoaderProps {
    rows?: number;
}

const FundTalliesWidgetLoader: React.FC<FundTalliesWidgetLoaderProps> = ({ rows = 6 }) => {
    return (
        <div className="rounded-lg border-2 border-gray-persist bg-background shadow-md animate-pulse">
            <div className="border-b border-gray-persist p-6">
                <div className="h-6 w-48 rounded-md bg-gray-persist" />
                <div className="mt-2 h-4 w-64 rounded-md bg-light-gray-persist" />
            </div>

            <div className="overflow-x-auto p-4">
                <table className="w-max min-w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-left text-sm text-content/60">
                            {Array.from({ length: 7 }).map((_, index) => (
                                <th key={index} className="px-4 py-2">
                                    <div className="h-3 w-20 rounded bg-light-gray-persist" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="rounded-lg bg-background-lighter">
                                {Array.from({ length: 7 }).map((_, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-3">
                                        <div className="h-4 w-full min-w-[3rem] rounded bg-gray-persist" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FundTalliesWidgetLoader;
