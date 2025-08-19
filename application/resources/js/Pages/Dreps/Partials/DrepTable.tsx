import PrimaryButton from '@/Components/atoms/PrimaryButton';
import CheckIcon from '@/Components/svgs/CheckIcon';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import axiosClient from '@/utils/axiosClient';
import { currency } from '@/utils/currency';
import { Button } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { toast } from 'react-toastify';
import CatalystDrepData = App.DataTransferObjects.CatalystDrepData;

interface DrepTableProps {
    dreps: CatalystDrepData[];
    delegatedDrepStakeAddress?: string;
}

export default function DrepTable({
    dreps,
    delegatedDrepStakeAddress,
}: DrepTableProps) {
    const { t } = useLaravelReactI18n();

    const [copySuccess, setCopySuccess] = useState<Record<number, boolean>>(
        Object.fromEntries(dreps.map((_, index) => [index, false])),
    );

    const [currentDelegatedDrep, setCurrentDelegatedDrep] = useState<
        string | null
    >(delegatedDrepStakeAddress || null);

    const {
        connectedWalletProvider,
        openConnectWalletSlider,
        extractSignature,
        stakeAddress,
        stakeKey,
    } = useConnectWallet();

    const tableColumns = [
        { label: t('dreps.drepList.drep') },
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

    const url = route('api.dreps.delegate');
    const user = usePage().props?.auth?.user;

    const handleDelegate = async (drepStakeAddress: string | null) => {
        try {
            if (currentDelegatedDrep) {
                toast.error('You can only delegate once', {
                    className: 'bg-background text-content',
                });
                return;
            }
            if (!drepStakeAddress) {
                toast.error('DRep stake address is required', {
                    className: 'bg-background text-content',
                });
                return;
            }
            if (!connectedWalletProvider || !stakeAddress) {
                openConnectWalletSlider();
                return;
            }

            let signatureResult: { signature: string; key: string } | null =
                null;

            if (user) {
                signatureResult = await extractSignature(
                    t('workflows.catalystDrepSignup.signMessage'),
                );
                if (!signatureResult) return;
            }

            const res = await axiosClient.post(url, {
                signature: signatureResult?.signature,
                signature_key: signatureResult?.key,
                stake_key: stakeKey,
                stakeAddress,
                drep_stake_address: drepStakeAddress,
            });

            if (res) {
                setCurrentDelegatedDrep(drepStakeAddress); 
                toast.success(res?.data?.message || 'Delegation Successful!', {
                    className: 'bg-background text-content',
                    toastId: 'delegation-successful',
                });
            }
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Delegation Failed!',
                {
                    className: 'bg-background text-content',
                    toastId: 'delegation-failed',
                },
            );
        }
    };

    const handleUndelegate = async (drepStakeAddress: string | null) => {
        try {
            if (!connectedWalletProvider || !stakeAddress) {
                openConnectWalletSlider();
                return;
            }

            const res = await axiosClient.post(route('api.dreps.undelegate'), {
                stakeAddress: stakeAddress,
                drepStakeAddress: drepStakeAddress,
            });

            if (res) {
                setCurrentDelegatedDrep(null);
                toast.success(
                    res?.data?.message || 'Undelegation Successful!',
                    {
                        toastId: 'undelegation-successful',
                        className: 'bg-background text-content',
                    },
                );
            }
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Undelegation Failed!',
                {
                    className: 'bg-background text-content',
                    toastId: 'undelegation-failed',
                },
            );
        }
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
                    {dreps.map((drep, index) => (
                        <tr key={index} className="border-dark/30 border-b">
                            <td className="text-gray-persist flex items-center gap-2 px-4 py-8">
                                <span>{drep?.stake_address}</span>
                                <Button
                                    className="text-content-light hover:text-content flex cursor-pointer items-center transition-colors duration-300 ease-in-out"
                                    onClick={() =>
                                        drep.stake_address
                                            ? handleCopy(
                                                  drep.stake_address,
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

                            {/* <td className="border-dark/30 border px-4 py-2">
                                <span> {drep.registeredOn}</span> <br />
                                <span className="text-gray-persist mt-2">
                                    {t('dreps.drepList.anHourAgo')}
                                </span>
                            </td> */}
                            <td className="border-dark/30 border px-4 py-2">
                                <span> {drep.last_active}</span> <br />
                                {/* <span className="text-gray-persist mt-2">
                                    {t('dreps.drepList.anHourAgo')}
                                </span> */}
                            </td>
                            <td className="border-dark/30 border px-4 py-2">
                                {drep.voting_power
                                    ? currency(drep.voting_power, 2, 'ADA')
                                    : '-'}
                            </td>
                            <td className="border-dark/30 border px-4 py-2">
                                {'-'}
                            </td>
                            <td className="border-dark/30 border px-4 py-2">
                                <div
                                    className={`flex items-center justify-center rounded border p-1.5 text-sm ${
                                        drep.status === 'Active'
                                            ? 'text-success border-success/50 bg-success/10'
                                            : 'text-error border-error/50 bg-error/10'
                                    }`}
                                >
                                    {'N/A'}
                                </div>
                            </td>
                            <td className="px-4 py-2">
                                <div className="group relative inline-block w-full">
                                    {drep?.stake_address ===
                                        currentDelegatedDrep &&
                                    currentDelegatedDrep ? (
                                        <PrimaryButton
                                            className="bg-primary text-content-light w-full rounded px-3 py-1 text-sm"
                                            onClick={() =>
                                                handleUndelegate(
                                                    drep.stake_address,
                                                )
                                            }
                                        >
                                            {t('dreps.drepList.undelegate')}
                                        </PrimaryButton>
                                    ) : (
                                        <PrimaryButton
                                            className="bg-primary text-content-light w-full rounded px-3 py-1 text-sm"
                                            onClick={() =>
                                                handleDelegate(
                                                    drep?.stake_address,
                                                )
                                            }
                                        >
                                            {t('dreps.drepList.delegate')}
                                        </PrimaryButton>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
