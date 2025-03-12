import CheckIcon from '@/Components/svgs/CheckIcon';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { Button } from '@headlessui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DrepTableProps extends Record<string, unknown> {
    dreps: Array<any>;
}

export default function DrepTable({ dreps }: DrepTableProps) {
    const { t } = useTranslation();
    const [copySuccess, setCopySuccess] = useState<Record<number, boolean>>(
        Object.fromEntries(dreps.map((_, index) => [index, false])),
    );

    const tableColumns = [
        { label: t('dreps.drepList.drep') },
        { label: t('dreps.drepList.registeredOn') },
        { label: t('dreps.drepList.lastActive') },
        { label: t('dreps.drepList.votingPower') },
        { label: t('dreps.drepList.delegators') },
        { label: t('dreps.drepList.status') },
        { label: t('dreps.drepList.delegate') },
    ];

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopySuccess((prev) => ({ ...prev, [index]: true }));

                setTimeout(() => {
                    setCopySuccess((prev) => {
                        const newState = { ...prev };
                        delete newState[index];
                        return newState;
                    });
                }, 2000);
            })
            .catch((err) => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="w-full overflow-x-auto overflow-y-auto rounded-t-lg shadow-md">
            <table className="border-dark/30 w-full border">
                <thead>
                    <tr className="bg-background-lighter border-dark/30 border-b">
                        {tableColumns.map((column, index) => (
                            <th
                                key={index}
                                className="text-gray-persist border-dark/30 border px-4 py-2 text-left"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dreps.map((drep, index) => (
                        <tr key={index} className="border-dark/30 border-b">
                            <td className="text-gray-persist flex items-center gap-2 px-4 py-8">
                                <span>{drep.drep}</span>
                                <Button
                                    className="text-content-light hover:text-content flex cursor-pointer items-center transition-colors duration-300 ease-in-out"
                                    onClick={() => handleCopy(drep.drep, index)}
                                    title="Copy URL"
                                >
                                    {copySuccess[index] ? (
                                        <span className="text-primary flex items-center">
                                            <CheckIcon className="h-4 w-4" />
                                        </span>
                                    ) : (
                                        <CopyIcon className="text-gray-persist/70 h-4 w-4" />
                                    )}
                                </Button>
                                {copySuccess[index] && (
                                    <span className="text-primary text-xs">
                                        {t('dreps.drepList.copied')}
                                    </span>
                                )}
                            </td>

                            <td className="border-dark/30 border px-4 py-2">
                                <span> {drep.registeredOn}</span> <br />
                                <span className="text-gray-persist mt-2">
                                    {t('dreps.drepList.anHourAgo')}
                                </span>
                            </td>
                            <td className="border-dark/30 border px-4 py-2">
                                <span> {drep.lastActive}</span> <br />
                                <span className="text-gray-persist mt-2">
                                    {t('dreps.drepList.anHourAgo')}
                                </span>
                            </td>
                            <td className="border-dark/30 border px-4 py-2">
                                {drep.votingPower}
                            </td>
                            <td className="border-dark/30 border px-4 py-2">
                                {drep.delegators}
                            </td>
                            <td className="border-dark/30 border px-4 py-2">
                                <div
                                    className={`flex items-center justify-center rounded border p-1.5 text-sm ${
                                        drep.status === 'Active'
                                            ? 'text-success border-success/50 bg-success/10'
                                            : 'text-error border-error/50 bg-error/10'
                                    }`}
                                >
                                    {drep.status}
                                </div>
                            </td>
                            <td className="border-dark/30 border px-4 py-2">
                                <Button className="bg-primary text-content-light cursor-pointer rounded px-3 py-1 text-sm">
                                    {t('dreps.drepList.delegate')}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
