import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';
import React, { useEffect, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { useForm } from '@inertiajs/react';
import lodashPkg from 'lodash';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Textarea from '@/Components/atoms/Textarea';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import InputError from '@/Components/InputError';
import RadioGroup from '@/Components/RadioGroup';
import CustomSwitch from '@/Components/atoms/Switch';
import Paragraph from '@/Components/atoms/Paragraph';
import { StatusEnum, VisibilityEnum } from '@/enums/votes-enums';
import { TinderWorkflowParams } from '@/enums/tinder-workflow-params';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import ErrorDisplay from '@/Components/atoms/ErrorDisplay';

interface Step2Props {
    stepDetails: any[];
    activeStep: number;
    preferences?: {
        selectedFund: number;
        proposalTypes: string[];
        proposalSizes: string[];
        impactTypes: string[];
        ListData: BookmarkCollectionData
    };
    step2Data?: {
        title?: string;
        content?: string;
        visibility?: string;
        comments_enabled?: boolean;
        color?: string;
        status?: string;
    };
    tinderCollectionHash: string;
    leftBookmarkCollectionHash: string;
    rightBookmarkCollectionHash: string;
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    preferences,
    step2Data,
    tinderCollectionHash,
    leftBookmarkCollectionHash,
    rightBookmarkCollectionHash,
}) => {
    const form = useForm({
        [TinderWorkflowParams.TITLE]: step2Data?.title || '',
        [TinderWorkflowParams.CONTENT]: step2Data?.content || '',
        [TinderWorkflowParams.SELECTED_FUND]: preferences?.selectedFund || '',
        [TinderWorkflowParams.VISIBILITY]: step2Data?.visibility  || VisibilityEnum.UNLISTED,
        [TinderWorkflowParams.COMMENTS_ENABLED]: step2Data?.comments_enabled  ?? false,
        [TinderWorkflowParams.COLOR]: step2Data?.color || '#2596BE',
        [TinderWorkflowParams.STATUS]: step2Data?.status  || StatusEnum.DRAFT,
    });


    const { lowerCase } = lodashPkg;
    const [isFormValid, setIsFormValid] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const localizedRoute = useLocalizedRoute;


    const { t } = useLaravelReactI18n();

    useEffect(() => {
        validateForm();
    }, [form.data]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.data[TinderWorkflowParams.TITLE].trim()) {
            newErrors[TinderWorkflowParams.TITLE] = t('workflows.tinderProposal.step2.titleRequired');
        }

        if (form.data[TinderWorkflowParams.CONTENT].length < 69) {
            newErrors[TinderWorkflowParams.CONTENT] = t('workflows.tinderProposal.step2.descriptionMinLength69');
        }

        setErrors(newErrors);

        setIsFormValid(
            Object.keys(newErrors).length === 0 &&
            !!form.data[TinderWorkflowParams.TITLE] &&
            form.data[TinderWorkflowParams.CONTENT].length >= 69,
        );
    };

    const submitForm = () => {
        form.post(
            generateLocalizedRoute(
                'workflows.tinderProposal.saveStep2',
                {
                    [TinderWorkflowParams.TINDER_COLLECTION_HASH]: tinderCollectionHash,
                    [TinderWorkflowParams.LEFT_BOOKMARK_COLLECTION_HASH]: leftBookmarkCollectionHash,
                    [TinderWorkflowParams.RIGHT_BOOKMARK_COLLECTION_HASH]: rightBookmarkCollectionHash,
                },
            ),
        );
    };

    return (
        <WorkflowLayout
            title="Tinder Proposal"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
            disclaimer={t('workflows.voterList.prototype')}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background mx-auto max-w-3xl border-black px-12 py-4 sm:py-8 xl:px-20">
                    <ErrorDisplay />

                    <div className="scrolling-touch max-h-[60vh] space-y-6 overflow-y-auto rounded-lg border border-gray-100 p-6 shadow-sm">
                        <div>
                            <ValueLabel className="text-content">
                                {t('workflows.tinderProposal.step2.title')}
                            </ValueLabel>
                            <div className="h-2"></div>
                            <TextInput
                                id="title"
                                className="w-full rounded-sm placeholder:text-sm"
                                placeholder={t(
                                    'workflows.tinderProposal.step2.titlePlaceholder',
                                )}
                                value={form.data[TinderWorkflowParams.TITLE]}
                                onChange={(e) =>
                                    form.setData(
                                        TinderWorkflowParams.TITLE,
                                        e.target.value,
                                    )
                                }
                                required
                                data-testid="tinder-proposal-title-input"
                            />
                            <InputError
                                message={
                                    form.errors[TinderWorkflowParams.TITLE]
                                }
                            />
                        </div>

                        <div className="mt-3">
                            <ValueLabel className="text-content">
                                {t('workflows.voterList.description')}
                            </ValueLabel>
                            <Textarea
                                id="content"
                                name="content"
                                minLengthValue={69}
                                minLengthEnforced
                                required
                                value={form.data[TinderWorkflowParams.CONTENT]}
                                onChange={(e) =>
                                    form.setData(
                                        TinderWorkflowParams.CONTENT,
                                        e.target.value,
                                    )
                                }
                                className="h-30 w-full rounded-lg px-4 py-2"
                                data-testid="tinder-proposal-content-textarea"
                            />
                            <InputError
                                message={
                                    form.errors[TinderWorkflowParams.CONTENT]
                                }
                            />
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
                                    selectedValue={
                                        form.data[
                                            TinderWorkflowParams.VISIBILITY
                                        ]
                                    }
                                    onChange={(value) =>
                                        form.setData(
                                            TinderWorkflowParams.VISIBILITY,
                                            value,
                                        )
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
                                    labelClassName="text-gray-persist ml-2"
                                    data-testid="tinder-visibility-radio-group"
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
                                    checked={
                                        form.data[
                                            TinderWorkflowParams
                                                .COMMENTS_ENABLED
                                        ]
                                    }
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            TinderWorkflowParams.COMMENTS_ENABLED,
                                            checked,
                                        )
                                    }
                                    color="bg-primary"
                                    size="md"
                                    className="!w-auto"
                                    data-testid="tinder-comments-switch"
                                />
                                <Paragraph className="text-gray-persist">
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
                                                    form.data[
                                                        TinderWorkflowParams
                                                            .COLOR
                                                    ],
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={
                                                form.data[
                                                    TinderWorkflowParams.COLOR
                                                ]
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    TinderWorkflowParams.COLOR,
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-background text-content border-none text-sm focus:outline-none"
                                            data-testid="color-text-input"
                                        />
                                        <input
                                            type="color"
                                            id="color-picker"
                                            value={
                                                form.data[
                                                    TinderWorkflowParams.COLOR
                                                ]
                                            }
                                            onChange={(e) =>
                                                form.setData(
                                                    TinderWorkflowParams.COLOR,
                                                    e.target.value,
                                                )
                                            }
                                            className="absolute top-0 left-0 h-full w-full cursor-pointer opacity-0"
                                            data-testid="color-picker-input"
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
                                    selectedValue={
                                        form.data[TinderWorkflowParams.STATUS]
                                    }
                                    onChange={(value) =>
                                        form.setData(
                                            TinderWorkflowParams.STATUS,
                                            value,
                                        )
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
                                    data-testid="tinder-status-radio-group"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Content>

            <Footer>
                <div className="flex w-full items-center justify-center px-5 pb-4 lg:px-15">
                    <PrimaryButton
                        className="w-full text-sm lg:px-8 lg:py-3"
                        disabled={!isFormValid}
                        onClick={submitForm}
                        data-testid="tinder-save-button"
                    >
                        <span>{t('workflows.tinderProposal.step2.save')}</span>
                    </PrimaryButton>
                </div>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
