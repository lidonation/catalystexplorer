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
import Selector from '@/Components/atoms/Selector';
import { useTranslation } from 'react-i18next';
import { VisibilityEnum, StatusEnum } from '@/enums/votes-enums';

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
        title: voterList?.title || '',
        visibility: voterList?.visibility || VisibilityEnum.UNLISTED,
        fund_slug: voterList?.fund_slug || latestFund?.slug,
        content: voterList?.content || '',
        comments_enabled: voterList?.allow_comments || false,
        color: voterList?.color || '#2596BE',
        status: voterList?.status || StatusEnum.DRAFT
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isFormTouched, setIsFormTouched] = useState(false);

    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
    });

    const { t } = useTranslation();

    useEffect(() => {
        if (!isFormTouched) {
            setIsFormTouched(true);
            return;
        }
        validateForm();
    }, [form.data]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.data.title.trim()) {
            newErrors.title = t('workflows.voterList.errors.titleRequired');
        }

        if (!form.data.fund_slug) {
            newErrors.fund_slug = t('workflows.voterList.errors.fundRequired');
        }

        if (form.data.content.length < 200) {
            newErrors.content = t('workflows.voterList.errors.descriptionLength');
        }

        setErrors(newErrors);

        setIsFormValid(
            Object.keys(newErrors).length === 0 &&
            !!form.data.title &&
            !!form.data.fund_slug &&
            form.data.content.length >= 200
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
                    <div className="space-y-6 rounded-lg p-6 shadow-sm border border-gray-100">

                        <div className="flex justify-end items-center mb-6">
                            <div className="flex items-center">
                                <ValueLabel className="mr-2 text-sm text-gray-persist font-bold">{t('workflows.voterList.selectFund')}</ValueLabel>
                                <Selector
                                    isMultiselect={false}
                                    selectedItems={form.data.fund_slug}
                                    setSelectedItems={(value) => {
                                        form.setData('fund_slug', value);
                                    }}
                                    options={funds?.map((fund: any) => ({
                                        label: fund.title,
                                        value: fund.slug
                                    }))}
                                    hideCheckbox={true}
                                    placeholder={t('workflows.voterList.selectFund')}
                                    className="w-64"
                                />
                            </div>
                        </div>
                        <div>
                            <ValueLabel className='text-content'>
                                {t('workflows.voterList.title')}
                            </ValueLabel>
                            <div className="h-2"></div>
                            <TextInput
                                id="title"
                                className="w-full !border-gray-persist !focus:border-gray-600 rounded-sm placeholder:text-sm"
                                placeholder={t('workflows.voterList.title')}
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                required
                            />
                            {errors.title && (
                                <Paragraph size="sm" className="text-red-500 mt-1">
                                    {errors.title}
                                </Paragraph>
                            )}
                        </div>

                        <div
                            onKeyDown={e => e.stopPropagation()}
                            onClick={e => e.stopPropagation()}
                            onFocus={e => e.stopPropagation()}
                        >
                            <ValueLabel className='text-content mb-4'>
                                {t('workflows.voterList.description')}
                            </ValueLabel>
                            <div className="h-2"></div>
                            <textarea
                                id="content"
                                rows={4}
                                style={{ whiteSpace: 'pre-wrap' }}
                                className="w-full bg-background rounded-md border border-gray-persist px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-sm whitespace-pre-wrap"
                                placeholder={t('workflows.voterList.descriptionPlaceholder')}
                                value={form.data.content}
                                onChange={(e) => {
                                    const valueWithWhitespace = e.target.value;
                                    form.setData('content', valueWithWhitespace);
                                    console.log('Text with whitespace:', valueWithWhitespace);
                                }}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <Paragraph size="sm" className="text-gray-persist text-[0.75rem]">
                                    {t('workflows.voterList.descriptionHint')}
                                </Paragraph>
                                <Paragraph size="sm" className="text-gray-persist text-[0.75rem]">
                                    {form.data.content.length}/200
                                </Paragraph>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                                <ValueLabel className='text-content'>
                                    {t('workflows.voterList.visibility')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9">
                                <RadioGroup
                                    name="visibility"
                                    selectedValue={form.data.visibility}
                                    onChange={(value) => form.setData('visibility', value)}
                                    options={[
                                        { value: VisibilityEnum.PUBLIC, label: t('workflows.voterList.visibilityOptions.public') },
                                        { value: VisibilityEnum.PRIVATE, label: t('workflows.voterList.visibilityOptions.private') },
                                        { value: VisibilityEnum.DELEGATORS, label: t('workflows.voterList.visibilityOptions.delegators') }
                                    ]}
                                    labelClassName="font-bold text-gray-persist ml-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                                <ValueLabel className='text-content'>
                                    {t('workflows.voterList.comments')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9 flex items-center gap-2">
                                <CustomSwitch
                                    checked={form.data.comments_enabled}
                                    onCheckedChange={(checked) => form.setData('comments_enabled', checked)}
                                    color="bg-primary"
                                    size="md"
                                    className="!w-auto"
                                />
                                <Paragraph size="sm" className="font-bold text-gray-persist">{t('workflows.voterList.commentsEnabled')}</Paragraph>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">

                                <ValueLabel className='text-content'>
                                    {t('workflows.voterList.chooseColor')}
                                </ValueLabel>

                                <Paragraph className="text-xs text-gray-persist">{t('workflows.voterList.pickTheme')}</Paragraph>
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

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-3">
                                <ValueLabel className='text-content'>
                                    {t('workflows.voterList.status')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9">
                                <RadioGroup
                                    name="status"
                                    selectedValue={form.data.status}
                                    onChange={(value) => form.setData('status', value)}
                                    options={[
                                        { value: StatusEnum.PUBLISHED, label: t('workflows.voterList.statusOptions.published') },
                                        { value: StatusEnum.DRAFT, label: t('workflows.voterList.statusOptions.draft') }
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