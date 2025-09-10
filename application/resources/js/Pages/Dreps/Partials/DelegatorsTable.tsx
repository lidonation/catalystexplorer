import PrimaryButton from '@/Components/atoms/PrimaryButton';
import CheckIcon from '@/Components/svgs/CheckIcon';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import axiosClient from '@/utils/axiosClient';
import { currency } from '@/utils/currency';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';
import { Button } from '@headlessui/react';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CatalystDrepData = App.DataTransferObjects.CatalystDrepData;
import UserData = App.DataTransferObjects.UserData;

interface DelegatorTableProps {
    delegators: UserData[];
}

export default function DelegatorTable({
    delegators
}: DelegatorTableProps) {
    const { t } = useLaravelReactI18n();

    const [copySuccess, setCopySuccess] = useState<Record<number, boolean>>(
        Object.fromEntries(delegators.map((_, index) => [index, false])),
    );

    const tableColumns = [
        { label: t('transactions.wallet.stakeKey') },
        { label: t('dreps.stake') },
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
            <table className="w-full">
                <thead>
                    <tr className="bg-background-lighter border-dark/30 border-b">
                        {tableColumns.map((column, index) => (
                            <th
                                key={index}
                                className={`text-gray-persist border-dark/30 px-4 py-2 text-left ${
                                    index === tableColumns.length - 1
                                        ? ''
                                        : 'border-r'
                                }`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {delegators.map((delegator, index) => (
                        <tr key={index} className="border-dark/30 border-b">
                            <td className="text-gray-persist flex items-center gap-2 px-4 py-8">
                                <span>{delegator?.stake_address}</span>
                                <Button
                                    className="text-content-light hover:text-content flex cursor-pointer items-center transition-colors duration-300 ease-in-out"
                                    onClick={() =>
                                        delegator.stake_address
                                            ? handleCopy(
                                                  delegator.stake_address,
                                                  index,
                                              )
                                            : ''
                                    }
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
                                {currency(delegator.voting_power ?? 0, 2, 'ADA')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
