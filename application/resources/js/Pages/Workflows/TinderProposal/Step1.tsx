import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { router, useForm } from '@inertiajs/react';
import { TinderWorkflowParams } from '@/enums/tinder-workflow-params';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Checkbox from '@/Components/atoms/Checkbox';
import Selector from '@/Components/atoms/Selector';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import CampaignData = App.DataTransferObjects.CampaignData
import FundData = App.DataTransferObjects.FundData
import { ParamsEnum } from '@/enums/proposal-search-params';
import { SearchParams } from '@/types/search-params';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';

interface Step1Props {
    stepDetails: any[];
    activeStep: number;
    funds: FundData[];
    campaigns: CampaignData[];
    latestFund: FundData;
    filters: SearchParams;
    existingPreferences?: {
        selectedFund: number;
        proposalTypes?: string[];
        proposalSizes?: string[];
        impactTypes?: string[];
    };
    isEditMode?: boolean;
    tinderCollectionHash?: string | null;
    leftBookmarkCollectionHash?: string | null;
    rightBookmarkCollectionHash?: string | null;
}

const Step1: React.FC<Step1Props> = ({ stepDetails, activeStep, existingPreferences,filters, isEditMode = false, tinderCollectionHash, leftBookmarkCollectionHash, rightBookmarkCollectionHash,latestFund, campaigns, funds }) => {
    const { t } = useLaravelReactI18n();

    /* const nextStep = generateLocalizedRoute('workflows.tinderProposal.index', {
        step: activeStep + 1,
    }); */

    const param = {
        [TinderWorkflowParams.STEP]: activeStep + 1,
        [TinderWorkflowParams.TINDER_COLLECTION_HASH]: tinderCollectionHash,
        [TinderWorkflowParams.LEFT_BOOKMARK_COLLECTION_HASH]: leftBookmarkCollectionHash,
        [TinderWorkflowParams.RIGHT_BOOKMARK_COLLECTION_HASH]: rightBookmarkCollectionHash,
    };

    // Use Inertia form for data submission with existing preferences pre-populated
    const { data, setData, post, processing } = useForm({
        [TinderWorkflowParams.SELECTED_FUND]: existingPreferences?.selectedFund ? String(existingPreferences.selectedFund) : String(latestFund.uuid) as string | null,
        [TinderWorkflowParams.PROPOSAL_TYPES]: existingPreferences?.proposalTypes || [] as string[],
        [TinderWorkflowParams.PROPOSAL_SIZES]: existingPreferences?.proposalSizes || [] as string[],
        [TinderWorkflowParams.IMPACT_TYPES]: existingPreferences?.impactTypes || [] as string[],
    });

    // Convert funds to have string values for the Selector component
    const fundOptions = funds.map(fund => ({
        label: fund.title || 'Untitled Fund',
        value: String(fund.uuid)
    }));

    const proposalTypeOptions = campaigns?.map(campaign => ({
        id: campaign.uuid || '',
        label: campaign.title || 'Untitled Campaign'
    }));

    // Proposal size options
    const proposalSizeOptions = [
        { id: 'small-scale', label: t('workflows.tinderProposal.step1.proposalSizes.smallScale') },
        { id: 'mid-size', label: t('workflows.tinderProposal.step1.proposalSizes.midSize') },
        { id: 'large-scale', label: t('workflows.tinderProposal.step1.proposalSizes.largeScale') },
    ];

    // Impact type options
    const impactTypeOptions = [
        { id: 'local-regional', label: t('workflows.tinderProposal.step1.impactTypes.localRegional') },
        { id: 'global-change', label: t('workflows.tinderProposal.step1.impactTypes.globalChange') },
        { id: 'ecosystem-development', label: t('workflows.tinderProposal.step1.impactTypes.ecosystemDevelopment') },
    ];

    const handleCheckboxChange = (
        value: string,
        currentArray: string[],
        field: typeof TinderWorkflowParams.PROPOSAL_TYPES | typeof TinderWorkflowParams.PROPOSAL_SIZES | typeof TinderWorkflowParams.IMPACT_TYPES
    ) => {
        if (currentArray.includes(value)) {
            setData(field, currentArray.filter(item => item !== value));
        } else {
            setData(field, [...currentArray, value]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(generateLocalizedRoute('workflows.tinderProposal.saveStep1', {
            ...param
        }));
    };

    const isFormValid = data[TinderWorkflowParams.SELECTED_FUND] !== null;

    const buildUpdatedFilters = (updates: Partial<SearchParams> = {}) => {
            const baseFilters: Record<string, any> = { ...filters };

            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    delete baseFilters[key];
                } else {
                    baseFilters[key] = value;
                }
            });

            if (
                Object.keys(updates).length > 0 &&
                !updates[ParamsEnum.PAGE] &&
                baseFilters[ParamsEnum.PAGE]
            ) {
                baseFilters[ParamsEnum.PAGE] = 1;
            }

            return baseFilters;
        };

    const handleFilterChange = (
            paramName: string,
            value: string | number | string[] | number[],
        ) => {
            // Get current URL parameters
            const currentParams = new URLSearchParams(window.location.search);
            const existingParams: Record<string, any> = {};

            // Preserve existing parameters
            currentParams.forEach((value, key) => {
                existingParams[key] = value;
            });

            router.get(
                window.location.pathname,
                buildUpdatedFilters({ ...existingParams, [paramName]: value }),
                { preserveState: true, replace: true },
            );
        };

    return (
          <FiltersProvider
                    defaultFilters={filters}
                    routerOptions={{
                        preserveScroll: true,
                    }}
                >
            <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
                <Nav stepDetails={stepDetails} activeStep={activeStep} />

                <Content>
                <div className="bg-background mx-auto max-w-3xl px-12 xl:px-20 py-4 sm:py-8 border-black">
                        <div className="space-y-6 rounded-lg border border-gray-100 p-6 shadow-sm max-h-[60vh] overflow-y-auto scrolling-touch">
                            <div className="space-y-6">
                                {/* Fund Selection */}
                                <div>
                                    <div className='flex text-sm gap-2 mb-2'>
                                        <Paragraph size='xs' className='text-content flex flex-row gap-1'>
                                            <span>
                                                {t('workflows.tinderProposal.step1.selectFund')}
                                            </span>
                                            <span className="italic">
                                                {t('workflows.tinderProposal.step1.selectAllThatApply')}
                                            </span>
                                        </Paragraph>
                                    </div>
                                    <Selector
                                        options={fundOptions}
                                        selectedItems={data[TinderWorkflowParams.SELECTED_FUND]}
                                        setSelectedItems={(value) => {
                                            setData(TinderWorkflowParams.SELECTED_FUND, value)
                                            handleFilterChange(
                                                TinderWorkflowParams.FUNDS,
                                                value,
                                          )
                                        }}
                                        placeholder={t('workflows.tinderProposal.step1.selectFundPlaceholder')}
                                        isMultiselect={false}
                                        hideCheckbox={true}
                                        className="w-full"
                                        data-testid='tinder-fund-selector'
                                    />
                                </div>

                                {/* Proposal Types */}
                                <div>
                                    <div className='flex flex-col text-sm gap-1 mb-2'>
                                        <Paragraph size='xs' className='text-content'>
                                            {t('workflows.tinderProposal.step1.proposalTypesQuestion')}
                                            &nbsp;
                                            <span className='italic text-xs text-content'>{t('workflows.tinderProposal.step1.selectAllThatApply')}</span>
                                        </Paragraph>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {proposalTypeOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={option.id}
                                                    checked={data[TinderWorkflowParams.PROPOSAL_TYPES].includes(option.id)}
                                                    onChange={() => handleCheckboxChange(option.id, data[TinderWorkflowParams.PROPOSAL_TYPES], TinderWorkflowParams.PROPOSAL_TYPES)}
                                                    data-testid={`proposal-type-checkbox`}
                                                />
                                                <label htmlFor={option.id} className="text-sm text-gray-persist">
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Proposal Size */}
                                <div>
                                    <div className='flex flex-col gap-1 mb-2'>
                                        <Paragraph size='xs' className='text-content'>
                                            {t('workflows.tinderProposal.step1.proposalSizeQuestion')}
                                            &nbsp;
                                            <span className='italic text-xs text-content'>{t('workflows.tinderProposal.step1.selectAllThatApply')}</span>
                                        </Paragraph>
                                    </div>
                                    <div className="space-y-3">
                                        {proposalSizeOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={option.id}
                                                    checked={data[TinderWorkflowParams.PROPOSAL_SIZES].includes(option.id)}
                                                    onChange={() => handleCheckboxChange(option.id, data[TinderWorkflowParams.PROPOSAL_SIZES], TinderWorkflowParams.PROPOSAL_SIZES)}
                                                    data-testid={`proposal-size-checkbox`}
                                                />
                                                <label htmlFor={option.id} className="text-sm text-gray-persist">
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Impact Type */}
                                <div>
                                    <div className='flex flex-col gap-1 mb-2'>
                                        <Paragraph size='xs' className='text-content'>
                                            {t('workflows.tinderProposal.step1.impactTypeQuestion')}
                                            &nbsp;
                                            <span className='italic text-xs text-content'>{t('workflows.tinderProposal.step1.selectAllThatApply')}</span>
                                        </Paragraph>
                                    </div>
                                    <div className="space-y-3">
                                        {impactTypeOptions.map((option) => (
                                            <div key={option.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={option.id}
                                                    checked={data[TinderWorkflowParams.IMPACT_TYPES].includes(option.id)}
                                                    onChange={() => handleCheckboxChange(option.id, data[TinderWorkflowParams.IMPACT_TYPES], TinderWorkflowParams.IMPACT_TYPES)}
                                                    data-testid={`impact-type-checkbox`}
                                                />
                                                <label htmlFor={option.id} className="text-sm text-gray-persist">
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Content>

                <Footer>
                    <div className="flex items-center justify-center w-full px-5 lg:px-15 pb-4">
                        <form onSubmit={handleSubmit} className="w-full">
                            <PrimaryButton
                                type="submit"
                                className="text-sm lg:px-8 py-3 w-full"
                                disabled={!isFormValid || processing}
                                data-testid='tinder-begin-button'
                            >
                                <span>{processing ? t('workflows.tinderProposal.step1.processing') : (isEditMode ? t('workflows.tinderProposal.step1.continue') : t('workflows.tinderProposal.step1.begin'))}</span>
                            </PrimaryButton>
                        </form>
                    </div>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step1;
