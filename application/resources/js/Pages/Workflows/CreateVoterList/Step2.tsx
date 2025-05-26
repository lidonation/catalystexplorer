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
import { lowerCase } from 'lodash';

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
                <div className="bg-background mx-auto max-w-3xl p-6 lg:p-8">
                    <div className="space-y-6 rounded-lg border border-gray-100 p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-end">
                            <div className="flex items-center">
                                <ValueLabel className="text-gray-persist mr-2 text-sm font-bold">
                                    {t('workflows.voterList.selectFund')}
                                </ValueLabel>
                                <Selector
                                    isMultiselect={false}
                                    selectedItems={form.data.fund_slug}
                                    setSelectedItems={(value) => {
                                        form.setData('fund_slug', value);
                                    }}
                                    options={funds?.map((fund: any) => ({
                                        label: fund.title,
                                        value: fund.slug,
                                    }))}
                                    hideCheckbox={true}
                                    placeholder={t(
                                        'workflows.voterList.selectFund',
                                    )}
                                    className="w-64"
                                />
                            </div>
                        </div>
                        <div>
                            <ValueLabel className="text-content">
                                {t('workflows.voterList.title')}
                            </ValueLabel>
                            <div className="h-2"></div>
                            <TextInput
                                id="title"
                                className="!border-gray-persist !focus:border-gray-600 w-full rounded-sm placeholder:text-sm"
                                placeholder={t('workflows.voterList.title')}
                                value={form.data.title}
                                onChange={(e) =>
                                    form.setData('title', e.target.value)
                                }
                                required
                            />
                            {errors.title && (
                                <Paragraph
                                    size="sm"
                                    className="text-danger-strong mt-1"
                                >
                                    {errors.title}
                                </Paragraph>
                            )}
                        </div>

                        <div
                            onKeyDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                        >
                            <ValueLabel className="text-content mb-4">
                                {t('workflows.voterList.description')}
                            </ValueLabel>
                            <div className="h-2"></div>
                            <textarea
                                id="content"
                                rows={4}
                                style={{ whiteSpace: 'pre-wrap' }}
                                className="bg-background border-gray-persist focus:ring-primary w-full rounded-md border px-4 py-2 whitespace-pre-wrap placeholder:text-sm focus:ring-1 focus:outline-none"
                                placeholder={t(
                                    'workflows.voterList.descriptionPlaceholder',
                                )}
                                value={form.data.content}
                                onChange={(e) => {
                                    const valueWithWhitespace = e.target.value;
                                    form.setData(
                                        'content',
                                        valueWithWhitespace,
                                    );
                                    console.log(
                                        'Text with whitespace:',
                                        valueWithWhitespace,
                                    );
                                }}
                            />
                            <div className="mt-1 flex items-center justify-between">
                                <Paragraph
                                    size="sm"
                                    className="text-gray-persist text-[0.75rem]"
                                >
                                    {t('workflows.voterList.descriptionHint')}
                                </Paragraph>
                                <Paragraph
                                    size="sm"
                                    className="text-gray-persist text-[0.75rem]"
                                >
                                    {form.data.content.length}/200
                                </Paragraph>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 items-center gap-4">
                            <div className="col-span-3">
                                <ValueLabel className="text-content">
                                    {t('workflows.voterList.visibility')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9">
                                <RadioGroup
                                    name="visibility"
                                    selectedValue={form.data.visibility}
                                    onChange={(value) =>
                                        form.setData('visibility', value)
                                    }
                                    options={[
                                        {
                                            value: lowerCase(
                                                VisibilityEnum.PUBLIC,
                                            ),
                                            label: t(
                                                'workflows.voterList.visibilityOptions.public',
                                            ),
                                        },
                                        {
                                            value: lowerCase(
                                                VisibilityEnum.PRIVATE,
                                            ),
                                            label: t(
                                                'workflows.voterList.visibilityOptions.private',
                                            ),
                                        },
                                        {
                                            value: lowerCase(
                                                VisibilityEnum.DELEGATORS,
                                            ),
                                            label: t(
                                                'workflows.voterList.visibilityOptions.delegators',
                                            ),
                                        },
                                    ]}
                                    labelClassName="font-bold text-gray-persist ml-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 items-center gap-4">
                            <div className="col-span-3">
                                <ValueLabel className="text-content">
                                    {t('workflows.voterList.comments')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9 flex items-center gap-2">
                                <CustomSwitch
                                    checked={form.data.comments_enabled}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'comments_enabled',
                                            checked,
                                        )
                                    }
                                    color="bg-primary"
                                    size="md"
                                    className="!w-auto"
                                />
                                <Paragraph
                                    size="sm"
                                    className="text-gray-persist font-bold"
                                >
                                    {t('workflows.voterList.commentsEnabled')}
                                </Paragraph>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 items-center gap-4">
                            <div className="col-span-3">
                                <ValueLabel className="text-content">
                                    {t('workflows.voterList.chooseColor')}
                                </ValueLabel>

                                <Paragraph className="text-gray-persist text-xs">
                                    {t('workflows.voterList.pickTheme')}
                                </Paragraph>
                            </div>
                            <div className="col-span-9 flex items-center">
                                <div className="relative">
                                    <div className="border-dark flex w-full items-center rounded-md border px-2">
                                        <div
                                            className="mr-2 h-4 w-4 rounded-sm"
                                            style={{
                                                backgroundColor:
                                                    form.data.color,
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={form.data.color}
                                            onChange={(e) =>
                                                form.setData(
                                                    'color',
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-background text-content border-none text-sm focus:outline-none"
                                        />
                                        <input
                                            type="color"
                                            id="color-picker"
                                            value={form.data.color}
                                            onChange={(e) =>
                                                form.setData(
                                                    'color',
                                                    e.target.value,
                                                )
                                            }
                                            className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 items-center gap-4">
                            <div className="col-span-3">
                                <ValueLabel className="text-content">
                                    {t('workflows.voterList.status')}
                                </ValueLabel>
                            </div>
                            <div className="col-span-9">
                                <RadioGroup
                                    name="status"
                                    selectedValue={form.data.status}
                                    onChange={(value) =>
                                        form.setData('status', value)
                                    }
                                    options={[
                                        {
                                            value: lowerCase(
                                                StatusEnum.PUBLISHED,
                                            ),
                                            label: t(
                                                'workflows.voterList.statusOptions.published',
                                            ),
                                        },
                                        {
                                            value: lowerCase(StatusEnum.DRAFT),
                                            label: t(
                                                'workflows.voterList.statusOptions.draft',
                                            ),
                                        },
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