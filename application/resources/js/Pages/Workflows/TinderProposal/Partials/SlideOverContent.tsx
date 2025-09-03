import Button from '@/Components/atoms/Button';
import ErrorDisplay from '@/Components/atoms/ErrorDisplay';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import CustomSwitch from '@/Components/atoms/Switch';
import Textarea from '@/Components/atoms/Textarea';
import TextInput from '@/Components/atoms/TextInput';
import ValueLabel from '@/Components/atoms/ValueLabel';
import InputError from '@/Components/InputError';
import RadioGroup from '@/Components/RadioGroup';
import EditIcon2 from '@/Components/svgs/EditIcon2';
import { TinderWorkflowParams } from '@/enums/tinder-workflow-params';
import { StatusEnum, VisibilityEnum } from '@/enums/votes-enums';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import lodashPkg from 'lodash';
import React from 'react';

interface SlideOverContentProps {
    editForm: any; // Using any for now since UseFormReturnType is not available
    formErrors: Record<string, string>;
    isFormValid: boolean;
    isEditingFields: boolean;
    onToggleEditingFields: () => void;
    onSaveEditForm: () => void;
    onDeleteCollection: () => void;
}

const SlideOverContent: React.FC<SlideOverContentProps> = ({
    editForm,
    formErrors,
    isFormValid,
    isEditingFields,
    onToggleEditingFields,
    onSaveEditForm,
    onDeleteCollection,
}) => {
    const { lowerCase } = lodashPkg;
    const { t } = useLaravelReactI18n();

    return (
        <div data-testid="edit-voter-list">
            <div>
                <ErrorDisplay />

                {!isEditingFields && (
                    <div className="mb-2 flex items-center">
                        <Paragraph size="lg" className="font-semibold">
                            {editForm.data[TinderWorkflowParams.TITLE]}
                        </Paragraph>
                        <Button
                            onClick={onToggleEditingFields}
                            className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100"
                            aria-label={
                                isEditingFields
                                    ? t(
                                          'workflows.tinderProposal.step4.viewMode',
                                      )
                                    : t(
                                          'workflows.tinderProposal.step4.editMode',
                                      )
                            }
                        >
                            <EditIcon2 className="text-gray-persist/[60%] h-5 w-5" />
                        </Button>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Display mode - show title and content as text */}
                    <div
                        className={`transition-all duration-300 ease-in-out ${
                            isEditingFields
                                ? 'max-h-0 overflow-hidden opacity-0'
                                : 'max-h-96 opacity-100'
                        }`}
                    >
                        <div className="space-y-4">
                            <div>
                                <div className="rounded-lg">
                                    <Paragraph className="text-gray-persist w-full break-words">
                                        {
                                            editForm.data[
                                                TinderWorkflowParams.CONTENT
                                            ]
                                        }
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit mode - show input fields */}
                    <div
                        className={`transition-all duration-300 ease-in-out ${
                            isEditingFields
                                ? 'max-h-96 opacity-100'
                                : 'max-h-0 overflow-hidden opacity-0'
                        }`}
                    >
                        <div className="space-y-4">
                            <div>
                                <ValueLabel className="text-content">
                                    {t('workflows.voterList.title')}
                                </ValueLabel>
                                <div className="h-2"></div>
                                <TextInput
                                    id={TinderWorkflowParams.TITLE}
                                    className="w-full rounded-sm placeholder:text-sm"
                                    placeholder="Title"
                                    value={
                                        editForm.data[
                                            TinderWorkflowParams.TITLE
                                        ]
                                    }
                                    onChange={(e) =>
                                        editForm.setData(
                                            TinderWorkflowParams.TITLE,
                                            e.target.value,
                                        )
                                    }
                                    required
                                    data-testid="title-input"
                                />
                                <InputError
                                    message={
                                        editForm.errors[
                                            TinderWorkflowParams.TITLE
                                        ] ||
                                        formErrors[TinderWorkflowParams.TITLE]
                                    }
                                />
                            </div>

                            <div className="mt-3">
                                <ValueLabel className="text-content">
                                    {t('workflows.voterList.description')}
                                </ValueLabel>
                                <Textarea
                                    id={TinderWorkflowParams.CONTENT}
                                    name={TinderWorkflowParams.CONTENT}
                                    minLengthValue={50}
                                    minLengthEnforced
                                    required
                                    value={
                                        editForm.data[
                                            TinderWorkflowParams.CONTENT
                                        ]
                                    }
                                    onChange={(e) =>
                                        editForm.setData(
                                            TinderWorkflowParams.CONTENT,
                                            e.target.value,
                                        )
                                    }
                                    className="h-30 w-full rounded-lg px-4 py-2"
                                    data-testid="content-textarea"
                                />
                                <InputError
                                    message={
                                        editForm.errors[
                                            TinderWorkflowParams.CONTENT
                                        ] ||
                                        formErrors[TinderWorkflowParams.CONTENT]
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Always visible fields */}
                    <div className="grid grid-cols-12 items-center gap-4">
                        <div className="col-span-3">
                            <ValueLabel className="text-content">
                                {t('workflows.voterList.visibility')}
                            </ValueLabel>
                        </div>
                        <div className="col-span-9">
                            <RadioGroup
                                name={TinderWorkflowParams.VISIBILITY}
                                selectedValue={
                                    editForm.data[
                                        TinderWorkflowParams.VISIBILITY
                                    ]
                                }
                                onChange={(value) =>
                                    editForm.setData(
                                        TinderWorkflowParams.VISIBILITY,
                                        value as VisibilityEnum,
                                    )
                                }
                                options={[
                                    {
                                        value: lowerCase(VisibilityEnum.PUBLIC),
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
                                data-testid="visibility-radio-group"
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
                                    editForm.data[
                                        TinderWorkflowParams.COMMENTS_ENABLED
                                    ]
                                }
                                onCheckedChange={(checked: boolean) =>
                                    editForm.setData(
                                        TinderWorkflowParams.COMMENTS_ENABLED,
                                        checked,
                                    )
                                }
                                color="bg-primary"
                                size="md"
                                className="!w-auto"
                                data-testid="comments-switch"
                            />
                            <Paragraph size="sm" className="text-gray-persist">
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
                                                editForm.data[
                                                    TinderWorkflowParams.COLOR
                                                ],
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={
                                            editForm.data[
                                                TinderWorkflowParams.COLOR
                                            ]
                                        }
                                        onChange={(e) =>
                                            editForm.setData(
                                                TinderWorkflowParams.COLOR,
                                                e.target.value,
                                            )
                                        }
                                        className="bg-background text-content border-none text-sm focus:outline-none"
                                        data-testid="color-input"
                                    />
                                    <input
                                        type="color"
                                        id="color-picker"
                                        value={
                                            editForm.data[
                                                TinderWorkflowParams.COLOR
                                            ]
                                        }
                                        onChange={(e) =>
                                            editForm.setData(
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
                                name={TinderWorkflowParams.STATUS}
                                selectedValue={
                                    editForm.data[TinderWorkflowParams.STATUS]
                                }
                                onChange={(value) =>
                                    editForm.setData(
                                        TinderWorkflowParams.STATUS,
                                        value as StatusEnum,
                                    )
                                }
                                options={[
                                    {
                                        value: lowerCase(StatusEnum.PUBLISHED),
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
                                data-testid="status-radio-group"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-6 w-full pt-6">
                    <div className="flex w-full gap-2">
                        <PrimaryButton
                            className="bg-primary hover:bg-primary/[70%] w-1/2 rounded-lg text-sm transition lg:py-3"
                            disabled={!isFormValid}
                            onClick={onSaveEditForm}
                            data-testid="save-button"
                        >
                            <Paragraph size="sm" className="text-content-light">
                                {t('Save')}
                            </Paragraph>
                        </PrimaryButton>
                        <Button
                            onClick={onDeleteCollection}
                            className="bg-error hover:bg-error/[70%] w-1/2 rounded-lg text-sm transition lg:py-3"
                            dataTestId="delete-button"
                        >
                            <Paragraph size="sm" className="text-content-light">
                                {t('workflows.tinderProposal.step4.delete')}
                            </Paragraph>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideOverContent;
