import Button from '@/Components/atoms/Button';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import Paginator from '@/Components/Paginator';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import axiosClient from '@/utils/axiosClient';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DrepDetailsCard from './Partials/DrepDetailCard';
import VoterHistoryTable from './Partials/VoterHistoryTable';
import CatalystDrepData = App.DataTransferObjects.CatalystDrepData;
import VotingHistoryData = App.DataTransferObjects.VoterHistoryData;
import DelegatorData = App.DataTransferObjects.UserData;
import DelegatorTable from './Partials/DelegatorsTable';

interface DrepPageProps {
    drep: CatalystDrepData;
    delegatedDrepStakeAddress?: string;
    delegators?: PaginatedData<DelegatorData[]>;
    filters: SearchParams;
}
const DrepPage = ({
    drep,
    delegatedDrepStakeAddress,
    delegators,
    filters,
}: DrepPageProps) => {
    const { t } = useLaravelReactI18n();
    const [activeTab, setActiveTab] = useState('Voting History');
    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
    };
    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log('Copied to clipboard:', text);
            })
            .catch((err) => {
                console.error('Failed to copy:', err);
            });
    };

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
                toast.info('Please connect your wallet to continue', {
                    className: 'bg-background text-content',
                });
                openConnectWalletSlider();
                return;
            }

            let signatureResult: { signature: string; key: string } | null =
                null;

            if (user && connectedWalletProvider) {
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

            router.reload({ only: ['catalystDreps'] });

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

                router.reload({
                    only: ['catalystDreps'],
                });

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

    const voterHistory = [
        {
            proposal_title: 'DeFi Lending Protocol',
            choice: 1
        },
        {
            proposal_title: 'Education for Africa',
            choice: 1
        },
        {
            proposal_title: 'Catalyst Tooling Upgrade',
            choice: 2
        },
        {
            proposal_title: 'Community Workshops',
            choice: 1
        },
        {
            proposal_title: 'NFT Infrastructure Upgrade',
            choice: 2
        },
        {
            proposal_title: 'Identity & Security Research',
            choice: 1
        },
    ]

    return (
        <FiltersProvider defaultFilters={filters}>
            <div className="w-full pt-8">
                <Head title="Dreps" />
                <header className="container flex w-full justify-between">
                    <div className="flex gap-2">
                        <Title level="2">
                            {formatAddress(drep?.stake_address ?? '')}
                        </Title>
                        <Button
                            onClick={() =>
                                copyToClipboard(drep?.stake_address ?? '')
                            }
                            className="ml-2 rounded-full p-1 hover:bg-gray-100"
                            ariaLabel={t('copyToClipboard')}
                        >
                            <CopyIcon
                                width={16}
                                height={16}
                                className="text-gray-persist"
                            />
                        </Button>
                        <div
                            className={`flex items-center justify-center rounded border p-1.5 text-sm ${
                                drep.status === 'active'
                                    ? 'text-success border-success/50 bg-success/10'
                                    : 'text-error border-error/50 bg-error/10'
                            }`}
                        >
                            {drep?.status ? drep.status : 'N/A'}
                        </div>
                    </div>
                    <div>
                        {drep?.stake_address === currentDelegatedDrep &&
                        currentDelegatedDrep ? (
                            <PrimaryButton
                                className="bg-primary text-content-light w-fit rounded px-3 py-1 text-sm"
                                onClick={() =>
                                    handleUndelegate(drep.stake_address)
                                }
                            >
                                {t('dreps.drepList.undelegate')}
                            </PrimaryButton>
                        ) : (
                            <PrimaryButton
                                className="bg-primary text-content-light w-fit rounded px-3 py-1 text-sm"
                                onClick={() =>
                                    handleDelegate(drep?.stake_address)
                                }
                            >
                                {t('dreps.drepList.delegate')}
                            </PrimaryButton>
                        )}
                    </div>
                </header>

                <main>
                    <div className="container mx-auto py-4">
                        <Link
                            href={useLocalizedRoute('dreps.list')}
                            className="text-primary inline-flex items-center text-sm"
                        >
                            <ChevronLeft />
                            <span className="ml-2">{t('back')}</span>
                        </Link>
                    </div>
                    <section>
                        <div className="container mb-8">
                            <DrepDetailsCard drep={drep} />
                        </div>
                    </section>

                    <section className="container">
                        <Card>
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        className={`cursor-pointer border-b-2 px-1 py-4 text-sm font-medium ${
                                            activeTab === 'Voting History'
                                                ? 'border-primary text-primary'
                                                : 'text-gray-persist border-transparent'
                                        }`}
                                        onClick={() =>
                                            setActiveTab('Voting History')
                                        }
                                    >
                                        {t('vote.votingHistory')}
                                    </button>
                                    <button
                                        className={`cursor-pointer border-b-2 px-1 py-4 text-sm font-medium ${
                                            activeTab === 'delegators'
                                                ? 'border-primary text-primary'
                                                : 'text-gray-persist border-transparent'
                                        }`}
                                        onClick={() =>
                                            setActiveTab('delegators')
                                        }
                                    >
                                        {t('dreps.drepList.delegators')}
                                    </button>
                                </nav>
                            </div>
                            <div className="py-4">
                                {activeTab === 'Voting History' ? (
                                    (voterHistory?.length ?? 0) > 0 ? (
                                        <>
                                            <VoterHistoryTable
                                                votingHistory={
                                                    voterHistory ?? []
                                                }
                                            />
                                        </>
                                    ) : (
                                        <RecordsNotFound />
                                    )
                                ) : (delegators?.data?.length ?? 0) > 0 ? (
                                    <>
                                        <DelegatorTable
                                            delegators={delegators?.data ?? []}
                                        />
                                        <div className="bg-background flex w-full items-center justify-center rounded-b-lg pt-2 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                                            <div className="mt-2">
                                                {delegators && (
                                                    <Paginator
                                                        pagination={delegators}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <RecordsNotFound />
                                )}
                            </div>
                        </Card>
                    </section>
                </main>
            </div>
        </FiltersProvider>
    );
};

export default DrepPage;
