import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { t } from 'i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import ValueLabel from '@/Components/atoms/ValueLabel';
import RadioGroup from '@/Components/RadioGroup';
import CustomSwitch from '@/Components/atoms/Switch';
import TextInput from '@/Components/atoms/TextInput';

interface Step2Props {
    stepDetails: StepDetails[];
    activeStep: number;
    funds: any;
    latestFund: any;
    voterList: any;
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    latestFund,
    funds,
    voterList
}) => {

    const form = useForm({
        title: voterList?.title || '', // Changed from name to title
        visibility: voterList?.visibility || 'UNLISTED', // Changed default to UNLISTED
        fund_slug: voterList?.fund_slug || latestFund?.id,
        description: voterList?.content || '', // Changed from description to content
        comments_enabled: voterList?.allow_comments || false, // Changed from comments_enabled
        color: voterList?.color || '#2596BE',
        status: voterList?.status || 'DRAFT' // Changed default to DRAFT
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
    });

    useEffect(() => {
        validateForm();
        // Log form data whenever it changes
        console.log('Current form data:', {
            title: form.data.title,
            visibility: form.data.visibility,
            fund_slug: form.data.fund_slug,
            description: form.data.description,
            comments_enabled: form.data.comments_enabled,
            color: form.data.color,
            status: form.data.status
        });
    }, [form.data]);

    useEffect(() => {
        console.log('Form data changed:', form.data);
    }, [form.data]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.data.title.trim()) {
            newErrors.title = t('Title is required');
        }

        if (!form.data.fund_slug) {
            newErrors.fund_slug = t('Fund selection is required');
        }

        setErrors(newErrors);

        setIsFormValid(
            Object.keys(newErrors).length === 0 &&
            !!form.data.title &&
            !!form.data.fund_slug
        );
    };

    const submitForm = () => {
        form.post(generateLocalizedRoute('workflows.createVoterList.saveListDetails'));
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className=" bg-background p-6 lg:p-8 max-w-3xl mx-auto">
                    <div className="flex justify-end items-center mb-6">
                        <span className="mr-2 text-sm text-red font-bold">{JSON.stringify(errors, null,)}</span>
                        <div className="flex items-center">
                            <span className="mr-2 text-sm text-gray-persist font-bold">{t('Select Fund')}</span>
                            <div className="relative">
                                <select
                                    id="fund"
                                    className="appearance-none bg-background text-sm text-gray-persist font-bold rounded-md border border-dark px-4 py-2 pr-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    value={form.data.fund_slug}
                                    onChange={(e) => {
                                        // Ensure we're setting just the ID value
                                        form.setData('fund_slug', e.target.value);
                                        console.log("Selected fund ID:", e.target.value);
                                    }}
                                >
                                    {funds?.map(fund => (
                                        <option
                                            key={fund.slug}
                                            value={fund.slug} // Ensure ID is a string
                                        >
                                            {fund.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 rounded-lg p-6 shadow-sm border border-gray-100">
                        {/* Title Input - leave as is */}
                        <div>
                            <ValueLabel className='text-content'>
                                {t('Title')}
                            </ValueLabel>
                            <div className="h-2"></div>
                            <TextInput
                                id="title" // Changed from name to title
                                className="w-full !border-gray-persist !focus:border-gray-600 rounded-sm placeholder:text-sm"
                                placeholder={t('Title')}
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                required
                            />
                        </div>

                        {/* Description Input - leave as is */}
                        <div>
                            <ValueLabel className='text-content mb-4'>
                                {t('Description')}
                            </ValueLabel>
                            <div className="h-2"></div>
                            <textarea
                                id="description"
                                rows={4}
                                className="w-full bg-background rounded-md border border-gray-persist px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-sm"
                                placeholder={t('Describe the purpose of this list in a few words.')}
                                value={form.data.description}
                                onChange={(e) => form.setData('description', e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-persist">
                                {t('Must be at least 200 characters.')}
                            </p>
                        </div>

                        {/* Visibility Options - use grid layout */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                                <ValueLabel className='text-content'>
                                    {t('Visibility')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9">
                                <RadioGroup
                                    name="visibility"
                                    selectedValue={form.data.visibility}
                                    onChange={(value) => form.setData('visibility', value)}
                                    options={[
                                        { value: 'public', label: t('Public') },
                                        { value: 'private', label: t('Private') },
                                        { value: 'delegators', label: t('Delegators') }
                                    ]}
                                    labelClassName="font-bold text-gray-persist ml-2"
                                />
                            </div>
                        </div>


                        {/* Comments Toggle */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                                <ValueLabel className='text-content'>
                                    {t('Comments')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9 flex items-center gap-2">
                                <CustomSwitch
                                    checked={form.data.comments_enabled}
                                    onCheckedChange={(checked) => form.setData('comments_enabled', checked)}
                                    color="bg-primary"
                                    size="md"
                                    className="!w-auto" // Override the w-full in the component
                                />
                                <Paragraph size="sm" className="font-bold text-gray-persist">{t('Comments Enabled')}</Paragraph>
                            </div>
                        </div>

                        {/* Choose Color */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">

                                <ValueLabel className='text-content'>
                                    {t('Choose Color')}
                                </ValueLabel>

                                <Paragraph className="text-xs text-gray-persist">{t('Pick list theme')}</Paragraph>
                            </div>
                            <div className="col-span-9 flex items-center">
                                <div className="relative">
                                    <div className="flex items-center border border-dark rounded-md px-2 w-full">
                                        <div
                                            className="w-4 h-4 rounded-sm mr-2"
                                            style={{ backgroundColor: form.data.color }}
                                        />
                                        <input
                                            type="text"
                                            value={form.data.color}
                                            onChange={(e) => form.setData('color', e.target.value)}
                                            className="bg-background text-content border-none focus:outline-none text-sm"
                                        />
                                        <input
                                            type="color"
                                            id="color-picker"
                                            value={form.data.color}
                                            onChange={(e) => form.setData('color', e.target.value)}
                                            className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Options */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                                <ValueLabel className='text-content'>
                                    {t('Status')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9">
                                <RadioGroup
                                    name="status"
                                    selectedValue={form.data.status}
                                    onChange={(value) => form.setData('status', value)}
                                    options={[
                                        { value: 'PUBLISHED', label: t('Publish') }, // Changed from publish to PUBLISHED
                                        { value: 'DRAFT', label: t('Draft') } // Changed from draft to DRAFT
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryButton
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={!isFormValid}
                    onClick={submitForm}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;