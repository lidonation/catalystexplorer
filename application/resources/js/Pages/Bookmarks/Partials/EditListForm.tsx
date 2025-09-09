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
import ColumnSelector, { ColumnKey } from '@/Components/ColumnSelector';
import { StatusEnum, VisibilityEnum } from '@/enums/votes-enums';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { InertiaFormProps, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import lodashPkg from 'lodash';
import { useEffect, useRef } from 'react';
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
    const { lowerCase } = lodashPkg;
    const { t } = useLaravelReactI18n();
    const colorInputRef = useRef<HTMLInputElement>(null);

    // Default PDF columns (same as in ProposalPdfView)
    const defaultPdfColumns: ColumnKey[] = ['title', 'budget', 'category', 'openSourced', 'teams'];
    
    const {
        value: selectedColumns,
        setValue: setSelectedColumns,
    } = useUserSetting<ColumnKey[]>(
        userSettingEnums.PROPOSAL_PDF_COLUMNS,
        defaultPdfColumns,
    );

    const {
        value: groupByCategories,
        setValue: setGroupByCategories,
    } = useUserSetting<boolean>(
        userSettingEnums.GROUP_BY_CATEGORIES as keyof App.DataTransferObjects.UserSettingData,
        false,
    );

    const form = useForm({
        title: bookmarkCollection?.title || '',
        visibility: bookmarkCollection?.visibility || VisibilityEnum.UNLISTED,
        content: bookmarkCollection?.content || '',
        comments_enabled: bookmarkCollection?.allow_comments || false,
        color: bookmarkCollection?.color || '#2596BE',
        status: bookmarkCollection?.status || StatusEnum.DRAFT,
    });

    const handleVisibilityChange = (value: string) => {
        form.setData('visibility', value);
    };

    const handleStatusChange = (value: string) => {
        form.setData('status', value);
    };
    
    const showColumnSelector = bookmarkCollection?.list_type === 'voter' || bookmarkCollection?.list_type === 'tinder';

    return (
        <div className="space-y-6 pt-6">
            <ErrorDisplay />

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
                    minLengthValue={69}
                    minLengthEnforced
                    required
                    value={form.data.content}
                    onChange={(e) => form.setData('content', e.target.value)}
                    className="h-30 w-full rounded-lg px-4 py-2"
                />
                <InputError message={form.errors.content} />
            </div>

            {/* Group by categories - only show for voting and tinder lists */}
            {showColumnSelector && (
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="mr-2">
                        <ValueLabel className="text-content">
                            Group by categories
                        </ValueLabel>
                    </div>
                    <div className="flex items-center gap-2">
                        <CustomSwitch
                            checked={groupByCategories ?? false}
                            onCheckedChange={(checked) => setGroupByCategories(checked)}
                            color="bg-primary"
                            size="md"
                            className="!w-auto"
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div>
                    <ValueLabel className="text-content">
                        {t('workflows.voterList.visibility')}
                    </ValueLabel>
                </div>
                <div>
                    <RadioGroup
                        name="visibility"
                        selectedValue={form.data.visibility}
                        onChange={handleVisibilityChange}
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
                        data-testid="visibility-radio-group"
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
                <div>
                    <ValueLabel className="text-content">
                        {t('workflows.voterList.chooseColor')}
                    </ValueLabel>
                    <Paragraph className="text-gray-persist text-xs">
                        {t('workflows.voterList.pickTheme')}
                    </Paragraph>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        ref={colorInputRef}
                        value={form.data.color}
                        onChange={(e) => form.setData('color', e.target.value)}
                        className="h-8 w-8 cursor-pointer border-none"
                    />
                    <TextInput
                        type="text"
                        value={form.data.color}
                        ref={colorInputRef}
                        onChange={(e) => form.setData('color', e.target.value)}
                    />
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
                        onChange={handleStatusChange}
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

            {/* Column Selector - only show for voting and tinder lists */}
            {showColumnSelector && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full">
                        <ValueLabel className="text-content">
                            {t('workflows.voterList.selectMetrics')}
                        </ValueLabel>
                    </div>
                    <div className="w-full">
                        <ColumnSelector
                            selectedColumns={selectedColumns || defaultPdfColumns}
                            onSelectionChange={setSelectedColumns}
                        />
                    </div>
                </div>
            )}

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
