import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import CustomSwitch from '@/Components/atoms/Switch';
import Textarea from '@/Components/atoms/Textarea';
import TextInput from '@/Components/atoms/TextInput';
import ValueLabel from '@/Components/atoms/ValueLabel';
import InputError from '@/Components/InputError';
import RadioGroup from '@/Components/RadioGroup';
import { StatusEnum, VisibilityEnum } from '@/enums/votes-enums';
import { InertiaFormProps, useForm } from '@inertiajs/react';
import { lowerCase } from 'lodash';
import { useTranslation } from 'react-i18next';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

export type ListForm = InertiaFormProps<{
    title: string;
    visibility: string;
    content: string;
    comments_enabled: boolean;
    color: string;
    status: string;
}>;

export default function EditListForm({
    bookmarkCollection,
    handleSave,
    handleDelete,
}: {
    bookmarkCollection: BookmarkCollectionData;
    handleSave: (form: ListForm) => void;
    handleDelete: () => void;
}) {
    const { t } = useTranslation();
    
    const form = useForm({
        title: bookmarkCollection?.title || '',
        visibility: bookmarkCollection?.visibility || VisibilityEnum.UNLISTED,
        content: bookmarkCollection?.content || '',
        comments_enabled: bookmarkCollection?.allow_comments || false,
        color: bookmarkCollection?.color || '#2596BE',
        status: bookmarkCollection?.status || StatusEnum.DRAFT,
    });

    return (
        <div className="space-y-6 pt-6">
            <div>
                <ValueLabel className="text-content">
                    {t('workflows.voterList.title')}
                </ValueLabel>
                <div className="h-2"></div>
                <TextInput
                    id="title"
                    className="w-full rounded-sm placeholder:text-sm"
                    placeholder={t('workflows.voterList.title')}
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                    required
                />
                <InputError message={form.errors.title} />
            </div>

            <div className="mt-3">
                <ValueLabel className="text-content">
                    {t('workflows.voterList.description')}
                </ValueLabel>
                <Textarea
                    id="content"
                    name="content"
                    minLengthValue={200}
                    minLengthEnforced
                    required
                    value={form.data.content}
                    onChange={(e) => form.setData('content', e.target.value)}
                    className="h-30 w-full rounded-lg px-4 py-2"
                />
                <InputError message={form.errors.content} />
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="">
                    <ValueLabel className="text-content">
                        {t('workflows.voterList.visibility')}
                    </ValueLabel>
                </div>
                <div className="">
                    <RadioGroup
                        name="visibility"
                        selectedValue={form.data.visibility}
                        onChange={(value) => form.setData('visibility', value)}
                        options={[
                            {
                                value: lowerCase(VisibilityEnum.PUBLIC),
                                label: t(
                                    'workflows.voterList.visibilityOptions.public',
                                ),
                            },
                            {
                                value: lowerCase(VisibilityEnum.PRIVATE),
                                label: t(
                                    'workflows.voterList.visibilityOptions.private',
                                ),
                            },
                            {
                                value: lowerCase(VisibilityEnum.DELEGATORS),
                                label: t(
                                    'workflows.voterList.visibilityOptions.delegators',
                                ),
                            },
                        ]}
                        labelClassName="font-bold text-gray-persist ml-2"
                        groupClassName="flex-no-wrap"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="mr-2">
                    <ValueLabel className="text-content">
                        {t('workflows.voterList.comments')}
                    </ValueLabel>
                </div>
                <div className="flex items-center gap-2">
                    <CustomSwitch
                        checked={form.data.comments_enabled}
                        onCheckedChange={(checked) =>
                            form.setData('comments_enabled', checked)
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

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="">
                    <ValueLabel className="text-content">
                        {t('workflows.voterList.chooseColor')}
                    </ValueLabel>

                    <Paragraph className="text-gray-persist text-xs">
                        {t('workflows.voterList.pickTheme')}
                    </Paragraph>
                </div>
                <div className="flex items-center">
                    <div className="relative">
                        <div className="border-gray-light flex w-full items-center rounded-md border px-2">
                            <div
                                className="mr-2 h-4 w-4 rounded-sm"
                                style={{
                                    backgroundColor: form.data.color,
                                }}
                            />
                            <input
                                type="text"
                                value={form.data.color}
                                onChange={(e) =>
                                    form.setData('color', e.target.value)
                                }
                                className="bg-background text-content border-none text-sm focus:outline-none"
                            />
                            <input
                                type="color"
                                id="color-picker"
                                value={form.data.color}
                                onChange={(e) =>
                                    form.setData('color', e.target.value)
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
                        onChange={(value) => form.setData('status', value)}
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
                    />
                </div>
            </div>

            <div className="flex justify-between gap-4">
                <PrimaryButton
                    onClick={() => handleSave(form)}
                    className="bg-primary flex-1 px-8 font-semibold"
                >
                    {t('Save')}
                </PrimaryButton>
                <Button
                    onClick={handleDelete}
                    className="bg-danger-mid text-content-light flex-1 rounded-md px-8 py-1.5 font-semibold"
                >
                    {t('Delete')}
                </Button>
            </div>
        </div>
    );
}
