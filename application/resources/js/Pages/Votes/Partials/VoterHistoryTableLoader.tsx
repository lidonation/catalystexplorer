import React from 'react';

interface VoteHistoryTableLoaderProps {
    rowCount?: number;
    className?: string;
    message?: string;
    showMessage?: boolean;
}

const VoteHistoryTableLoader: React.FC<VoteHistoryTableLoaderProps> = ({
    rowCount = 8,
    className = '',
}) => {
    const rows = Array(rowCount).fill(null);

    return (
        <div className="bg-background overflow-x-auto rounded-lg shadow-lg">
            <section className="container">
                <div className="border-dark-light border-b pt-4 pb-4">
                    <div className="bg-background-light h-8 w-36 animate-pulse rounded"></div>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="relative max-w-2xl flex-1">
                        <div className="bg-background-light h-10 w-full animate-pulse rounded"></div>
                    </div>
                    <div className="flex space-x-2">
                        <div className="bg-background-light h-10 w-32 animate-pulse rounded"></div>
                        <div className="bg-background-light h-10 w-24 animate-pulse rounded"></div>
                    </div>
                </div>
            </section>

            <div className="container mb-4">
                <div className="bg-background border-dark-light w-full overflow-hidden rounded-lg border shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-max min-w-full">
                            <thead className="bg-background-lighter whitespace-nowrap">
                                <tr>
                                    <th className="border-dark-light text-content-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                        <div className="bg-background-light h-5 w-16 animate-pulse rounded"></div>
                                    </th>
                                    <th className="border-dark-light text-content-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                        <div className="bg-background-light h-5 w-24 animate-pulse rounded"></div>
                                    </th>
                                    <th className="border-dark-light text-content-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                        <div className="bg-background-light h-5 w-20 animate-pulse rounded"></div>
                                    </th>
                                    <th className="border-dark-light text-content-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                        <div className="bg-background-light h-5 w-14 animate-pulse rounded"></div>
                                    </th>
                                    <th className="border-dark-light text-content-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                        <div className="bg-background-light h-5 w-20 animate-pulse rounded"></div>
                                    </th>
                                    <th className="border-dark-light text-content-gray-persist border-r border-b px-4 py-3 text-center font-medium">
                                        <div className="bg-background-light mx-auto h-5 w-14 animate-pulse rounded"></div>
                                    </th>
                                    <th className="border-dark-light text-content-gray-persist border-r border-b px-4 py-3 text-left font-medium">
                                        <div className="bg-background-light h-5 w-22 animate-pulse rounded"></div>
                                    </th>
                                    <th className="border-dark-light text-content-gray-persist border-b px-4 py-3 text-left font-medium">
                                        <div className="bg-background-light h-5 w-24 animate-pulse rounded"></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="whitespace-nowrap">
                                {rows.map((_, index) => (
                                    <tr
                                        key={index}
                                        className={
                                            index % 2 === 0
                                                ? 'bg-background-lighter'
                                                : 'bg-background'
                                        }
                                    >
                                        <td className="border-dark-light border-r border-b px-4 py-4">
                                            <div className="bg-background-light h-5 w-16 animate-pulse rounded"></div>
                                        </td>
                                        <td className="border-dark-light border-r border-b px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="bg-background-light h-5 w-24 animate-pulse rounded"></div>
                                            </div>
                                        </td>
                                        <td className="border-dark-light border-r border-b px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="bg-background-light h-5 w-20 animate-pulse rounded"></div>
                                            </div>
                                        </td>
                                        <td className="border-dark-light border-r border-b px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="bg-background-light h-5 w-14 animate-pulse rounded"></div>
                                            </div>
                                        </td>
                                        <td className="border-dark-light border-r border-b px-4 py-4">
                                            <div className="flex flex-col">
                                                <div className="bg-background-light mb-1 h-5 w-20 animate-pulse rounded"></div>
                                                <div className="bg-background-light h-3 w-14 animate-pulse rounded"></div>
                                            </div>
                                        </td>
                                        <td className="border-dark-light border-r border-b px-4 py-4 text-center">
                                            <div className="bg-background-light mx-auto h-5 w-5 animate-pulse rounded"></div>
                                        </td>
                                        <td className="border-dark-light border-r border-b px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="bg-background-light h-5 w-16 animate-pulse rounded"></div>
                                            </div>
                                        </td>
                                        <td className="border-dark-light border-b px-4 py-4">
                                            <div className="flex items-center">
                                                <div className="bg-background-light h-5 w-24 animate-pulse rounded"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-background border-dark-light rounded-b-lg border-t p-2">
                        <div className="flex items-center justify-between">
                            <div className="flex space-x-1">
                                <div className="bg-background-light h-8 w-24 animate-pulse rounded"></div>
                            </div>
                            <div className="flex space-x-1">
                                <div className="bg-background-light h-8 w-10 animate-pulse rounded"></div>
                                <div className="bg-background-light h-8 w-10 animate-pulse rounded"></div>
                                <div className="bg-background-light h-8 w-10 animate-pulse rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoteHistoryTableLoader;
