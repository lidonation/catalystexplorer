import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { StepDetails } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import SelectWalletCard from './Partials/SelectWalletCard';

interface WalletStats {
    all_time_votes: number;
    stakeAddress: string;
    funds_participated: string[];
    balance: string;
    status?: boolean;
}

interface WalletData {
    id: string;
    name: string;
    networkName: string;
    stakeAddress: string;
    userAddress: string;
    paymentAddresses?: string[];
    walletDetails: WalletStats;
    catId: string;
    linked?: boolean;
}

interface Step1Props {
    stepDetails: StepDetails[];
    activeStep: number;
    proposal: string;
    wallets?: PaginatedData<WalletData[]>;
}

const Step1: React.FC<Step1Props> = ({
    stepDetails,
    activeStep,
    proposal,
    wallets,
}) => {
    const { t } = useLaravelReactI18n();
    const [copySuccesses, setCopySuccesses] = useState<Record<string, boolean>>(
        {},
    );
    const [expandedAddresses, setExpandedAddresses] = useState<
        Record<string, boolean>
    >({});
    const [stakeAddress, setStakeAddress] = useState<string | null>(
        null,
    );

    const localizedRoute = useLocalizedRoute;

    const prevStep =''
    const nextStep = localizedRoute('workflows.linkWallet.index', {
        step: activeStep + 1,
        proposal,
        stakeAddress,
    });

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value).then(() => {
            setCopySuccesses((prev) => ({ ...prev, [value]: true }));
            setTimeout(() => {
                setCopySuccesses((prev) => ({ ...prev, [value]: false }));
            }, 2000);
        });
    };

    const toggleAddressExpansion = (walletId: string) => {
        setExpandedAddresses((prev) => ({
            ...prev,
            [walletId]: !prev[walletId],
        }));
    };

    const handleWalletSelect = (wallet: WalletData) => {
        setStakeAddress(wallet.stakeAddress);
    };

    return (
        <FiltersProvider defaultFilters={{} as SearchParams}>
            <WorkflowLayout
                title="Link Wallet"
                asideInfo={stepDetails[activeStep - 1].info ?? ''}
            >
                <Nav stepDetails={stepDetails} activeStep={activeStep} />

                <Content>
                    <div className="flex h-full w-full flex-col gap-6">
                        <PrimaryLink
                            className="lg:text-md mb-4 mt-4 mr-8 ml-auto px-4 py-2 text-sm text-nowrap"
                            href={useLocalizedRoute(
                                'workflows.signature.index',
                                {
                                    step: 1,
                                },
                            )}
                        >
                            {`+ ${t('my.connectWallet')}`}
                        </PrimaryLink>
                        {wallets && wallets.data.length > 0 ? (
                            <div className="h-full w-full overflow-y-auto px-8">
                                <div className="grid grid-cols-1 gap-6">
                                    {wallets.data.map((wallet) => (
                                        <SelectWalletCard
                                            wallet={wallet}
                                            key={wallet.id}
                                            copySuccesses={copySuccesses}
                                            onCopy={handleCopy}
                                            expandedAddresses={
                                                expandedAddresses
                                            }
                                            onToggleAddressExpansion={
                                                toggleAddressExpansion
                                            }
                                            selectedWalletId={stakeAddress}
                                            onSelect={() => handleWalletSelect(wallet)}
                                            disabled={wallet?.linked}
                                        />
                                    ))}
                                </div>
                                <div className="mt-8 w-full">
                                    <Paginator pagination={wallets} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <RecordsNotFound />
                            </div>
                        )}
                    </div>
                </Content>

                <Footer>
                    <PrimaryLink
                        href={prevStep}
                        className="text-sm lg:px-8 lg:py-3"
                        disabled={activeStep == 1}
                        onClick={(e) => activeStep == 1 && e.preventDefault()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>{t('previous')}</span>
                    </PrimaryLink>
                    <PrimaryLink
                        className="text-sm lg:px-8 lg:py-3"
                        disabled={!stakeAddress}
                        href={nextStep}
                    >
                        <span>{t('profileWorkflow.next')}</span>
                        <ChevronRight className="h-4 w-4" />
                    </PrimaryLink>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step1;