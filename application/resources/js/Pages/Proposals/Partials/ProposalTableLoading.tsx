import React from 'react';

const ProposalTableLoading: React.FC = () => {
    return (
        <div className="w-full overflow-x-auto rounded-t-lg border border-gray-200 shadow-[0_-1px_4px_0_rgba(0,0,0,0.05)]" data-testid="proposal-table-loading-container">
            <div className="inline-block min-w-full overflow-hidden" data-testid="proposal-table-loading-wrapper">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden" data-testid="proposal-table-loading">
                    <thead className="bg-background-lighter" data-testid="proposal-table-loading-header">
                        <tr data-testid="proposal-table-loading-header-row">
                            <th className="sticky top-0 border border-gray-200 px-4 py-3 text-left first:rounded-tl-lg">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </th>
                            <th className="sticky top-0 border border-gray-200 px-4 py-3 text-left">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </th>
                            <th className="sticky top-0 border border-gray-200 px-4 py-3 text-left">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </th>
                            <th className="sticky top-0 border border-gray-200 px-4 py-3 text-left">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </th>
                            <th className="sticky top-0 border border-gray-200 px-4 py-3 text-left last:rounded-tr-lg">
                                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody data-testid="proposal-table-loading-body">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <tr key={index} className={index < 9 ? 'border-b border-gray-200' : ''}>
                                <td className="border border-gray-200 px-4 py-3">
                                    <div className="w-80">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                    </div>
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    <div className="flex items-center justify-center">
                                        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    <div className="flex w-32 items-center justify-center">
                                        <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProposalTableLoading;
