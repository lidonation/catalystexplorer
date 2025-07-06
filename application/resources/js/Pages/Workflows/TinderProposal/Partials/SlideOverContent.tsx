import React from 'react';
import { useTranslation } from 'react-i18next';
import { lowerCase } from 'lodash';

import Paragraph from '@/Components/atoms/Paragraph';
import TextInput from '@/Components/atoms/TextInput';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Textarea from '@/Components/atoms/Textarea';
import InputError from '@/Components/InputError';
import RadioGroup from '@/Components/RadioGroup';
import CustomSwitch from '@/Components/atoms/Switch';
import { StatusEnum, VisibilityEnum } from '@/enums/votes-enums';
import { TinderWorkflowParams } from '@/enums/tinder-workflow-params';
import Button from '@/Components/atoms/Button';
import EditIcon2 from '@/Components/svgs/EditIcon2';

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
    const { t } = useTranslation();

    return (
        <div>
            <div>
                {!isEditingFields && (
                    <div className="flex items-center mb-2">
                        <Paragraph size='lg' className="font-semibold">
                            {editForm.data[TinderWorkflowParams.TITLE]}
                        </Paragraph>
                        <Button
                            onClick={onToggleEditingFields}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            aria-label={isEditingFields ? t('workflows.tinderProposal.step4.viewMode') : t('workflows.tinderProposal.step4.editMode')}
                        >
                            <EditIcon2 className="w-5 h-5 text-gray-persist/[60%]" />
                        </Button>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Display mode - show title and content as text */}
                    <div 
                        className={`transition-all duration-300 ease-in-out ${
                            isEditingFields 
                                ? 'opacity-0 max-h-0 overflow-hidden' 
                                : 'opacity-100 max-h-96'
                        }`}
                    >
                        <div className="space-y-4">
                            <div>
                                <div className="rounded-lg">
                                    <Paragraph className="text-gray-persist w-full break-words">
                                        {editForm.data[TinderWorkflowParams.CONTENT]}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit mode - show input fields */}
                    <div 
                        className={`transition-all duration-300 ease-in-out ${
                            isEditingFields 
                                ? 'opacity-100 max-h-96' 
                                : 'opacity-0 max-h-0 overflow-hidden'
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
                                    value={editForm.data[TinderWorkflowParams.TITLE]}
                                    onChange={(e) =>
                                        editForm.setData(TinderWorkflowParams.TITLE, e.target.value)
                                    }
                                    required
                                />
                                <InputError message={editForm.errors[TinderWorkflowParams.TITLE] || formErrors[TinderWorkflowParams.TITLE]} />
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
                                    value={editForm.data[TinderWorkflowParams.CONTENT]}
                                    onChange={(e) =>
                                        editForm.setData(TinderWorkflowParams.CONTENT, e.target.value)
                                    }
                                    className="h-30 w-full rounded-lg px-4 py-2"
                                />
                                <InputError message={editForm.errors[TinderWorkflowParams.CONTENT] || formErrors[TinderWorkflowParams.CONTENT]} />
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
                                selectedValue={editForm.data[TinderWorkflowParams.VISIBILITY]}
                                onChange={(value) =>
                                    editForm.setData(TinderWorkflowParams.VISIBILITY, value as VisibilityEnum)
                                }
                                options={[
                                    {
                                        value: lowerCase(VisibilityEnum.PUBLIC),
                                        label: t('workflows.voterList.visibilityOptions.public'),
                                    },
                                    {
                                        value: lowerCase(VisibilityEnum.PRIVATE),
                                        label: t('workflows.voterList.visibilityOptions.private'),
                                    },
                                    {
                                        value: lowerCase(VisibilityEnum.DELEGATORS),
                                        label: t('workflows.voterList.visibilityOptions.delegators'),
                                    },
                                ]}
                                labelClassName="text-gray-persist ml-2"
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
                                checked={editForm.data[TinderWorkflowParams.COMMENTS_ENABLED]}
                                onCheckedChange={(checked: boolean) =>
                                    editForm.setData(TinderWorkflowParams.COMMENTS_ENABLED, checked)
                                }
                                color="bg-primary"
                                size="md"
                                className="!w-auto"
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
                                            backgroundColor: editForm.data[TinderWorkflowParams.COLOR],
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={editForm.data[TinderWorkflowParams.COLOR]}
                                        onChange={(e) =>
                                            editForm.setData(TinderWorkflowParams.COLOR, e.target.value)
                                        }
                                        className="bg-background text-content border-none text-sm focus:outline-none"
                                    />
                                    <input
                                        type="color"
                                        id="color-picker"
                                        value={editForm.data[TinderWorkflowParams.COLOR]}
                                        onChange={(e) =>
                                            editForm.setData(TinderWorkflowParams.COLOR, e.target.value)
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
                                name={TinderWorkflowParams.STATUS}
                                selectedValue={editForm.data[TinderWorkflowParams.STATUS]}
                                onChange={(value) =>
                                    editForm.setData(TinderWorkflowParams.STATUS, value as StatusEnum)
                                }
                                options={[
                                    {
                                        value: lowerCase(StatusEnum.PUBLISHED),
                                        label: t('workflows.voterList.statusOptions.published'),
                                    },
                                    {
                                        value: lowerCase(StatusEnum.DRAFT),
                                        label: t('workflows.voterList.statusOptions.draft'),
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center w-full px-5 lg:px-15 pt-6 mt-6">
                    <div className="flex gap-4 w-full">
                        <Button
                            className="text-sm lg:px-8 lg:py-3 flex-1 rounded-lg bg-primary hover:bg-primary/[70%] transition"
                            disabled={!isFormValid}
                            onClick={onSaveEditForm}
                        >
                            <Paragraph size='sm' className='text-content-light'>{t('Save')}</Paragraph>
                        </Button>
                        <Button
                            onClick={onDeleteCollection}
                            className="text-sm lg:px-8 lg:py-3 flex-1 bg-error hover:bg-error/[70%] rounded-lg transition"
                        >
                            <Paragraph size='sm' className='text-content-light'>{t('workflows.tinderProposal.step4.delete')}</Paragraph>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideOverContent;
