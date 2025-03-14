import { Head, Link } from '@inertiajs/react';

export interface Transaction {
    id: number;
    hash: string;
    block_id: number;
    tx_index: number;
    is_valid: boolean;
    metadata_label: number;
    metadata_labels: number[]; // Array of label IDs
    label_names: string[]; // Array of label names
    primary_label_name: string; // Name of the primary label
    inputs: any;
    outputs: any;
    metadata: any;
}

interface Props {
    catalystTransactions: {
        data: Transaction[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    metadataLabels: Record<number, string>;
}

export default function Transactions({
    catalystTransactions,
    metadataLabels,
}: Props) {
    return (
        <>
            <Head title="Catalyst Transactions" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-background overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
                        <h2 className="mb-4 text-2xl font-bold">
                            Catalyst Transactions
                        </h2>

                        {/* Transactions table */}
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-background-lighter">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Hash
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Block
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Valid
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {catalystTransactions.data.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="text-content px-6 py-4 text-sm font-medium whitespace-nowrap">
                                            {tx.hash
                                                ? typeof tx.hash === 'string'
                                                    ? tx.hash.substring(0, 16)
                                                    : 'Invalid Hash'
                                                : 'No Hash'}
                                            ...
                                        </td>
                                        <td className="text-content px-6 py-4 text-sm whitespace-nowrap">
                                            {tx.block_id}
                                        </td>
                                        <td className="text-content px-6 py-4 text-sm whitespace-nowrap">
                                            {/* Display all labels as badges */}
                                            <div className="flex flex-col flex-wrap gap-1">
                                                {tx.label_names ? (
                                                    tx.label_names.map(
                                                        (label, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-medium text-blue-800 w-fit"
                                                            >
                                                                {label}
                                                            </span>
                                                        ),
                                                    )
                                                ) : (
                                                    <span>
                                                        {metadataLabels[
                                                            tx.metadata_label
                                                        ] || 'Unknown'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                                    tx.is_valid
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {tx.is_valid
                                                    ? 'Valid'
                                                    : 'Invalid'}
                                            </span>
                                        </td>
                                        <td className="text-content px-6 py-4 text-sm whitespace-nowrap">
                                            <Link
                                                href={`/catalyst-txns/${tx.id}`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {catalystTransactions.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Link
                                        href={
                                            catalystTransactions.links[0].url ||
                                            ''
                                        }
                                        className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${!catalystTransactions.links[0].url ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
                                        preserveScroll
                                    >
                                        Previous
                                    </Link>
                                    <Link
                                        href={
                                            catalystTransactions.links[
                                                catalystTransactions.links
                                                    .length - 1
                                            ].url || ''
                                        }
                                        className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${!catalystTransactions.links[catalystTransactions.links.length - 1].url ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'}`}
                                        preserveScroll
                                    >
                                        Next
                                    </Link>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-content text-sm">
                                            Showing{' '}
                                            <span className="font-medium">
                                                {catalystTransactions.from}
                                            </span>{' '}
                                            to{' '}
                                            <span className="font-medium">
                                                {catalystTransactions.to}
                                            </span>{' '}
                                            of{' '}
                                            <span className="font-medium">
                                                {catalystTransactions.total}
                                            </span>{' '}
                                            results
                                        </p>
                                    </div>
                                    <div>
                                        <nav
                                            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                            aria-label="Pagination"
                                        >
                                            {catalystTransactions.links.map(
                                                (link, index) => {
                                                    if (
                                                        index === 0 ||
                                                        index ===
                                                            catalystTransactions
                                                                .links.length -
                                                                1
                                                    ) {
                                                        return null;
                                                    }

                                                    return (
                                                        <Link
                                                            key={index}
                                                            href={
                                                                link.url || ''
                                                            }
                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                                link.active
                                                                    ? 'z-10 bg-indigo-600 text-white focus:z-20'
                                                                    : 'bg-white text-gray-500 hover:bg-gray-50 focus:z-20'
                                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                            preserveScroll
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    );
                                                },
                                            )}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
