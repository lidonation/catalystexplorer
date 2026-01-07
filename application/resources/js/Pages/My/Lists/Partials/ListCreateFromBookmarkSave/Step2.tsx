import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import CustomSwitch from '@/Components/atoms/Switch';
import TextInput from '@/Components/atoms/TextInput';
import ArrowLeftIcon from '@/Components/svgs/ArrowLeft';
import { useList } from '@/Context/ListContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import { z } from 'zod';
import { TransitionListPageProps } from '../../../../../types/general';

const createFormSchema = (t: (key: string) => string) =>
    z.object({
        name: z
            .string({
                message: t('listQuickCreate.validationErrors.name'),
            })
            .min(5, t('listQuickCreate.validationErrors.shortName')),
        description: z
            .string()
            .min(10, t('listQuickCreate.validationErrors.shortDescription')),
        isPublic: z.boolean().default(false),
    });

type FormState = {
    name: string;
    description: string;
    isPublic: boolean;
};

const BookmarkPage2 = ({ onNavigate }: TransitionListPageProps) => {
    const { t } = useLaravelReactI18n();
    const { addList, isAddingList } = useList();
    const [error, setError] = useState<Error | null>(null);
    const [formState, setFormState] = useState<FormState>({
        name: '',
        description: '',
        isPublic: false,
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        try {
            const schema = createFormSchema(t);
            schema.parse(formState);

            await addList({
                title: formState.name,
                content: formState.description,
                visibility: formState.isPublic ? 'public' : 'private',
            });

            setFormState({
                name: '',
                description: '',
                isPublic: false,
            });
            setError(null);

            onNavigate?.(2);
        } catch (error) {
            console.log(error);
            if (error instanceof z.ZodError) {
                const firstError = error.issues[0];
                setError(new Error(firstError.message));
            } else if (error instanceof Error) {
                setError(error);
            } else {
                setError(
                    new Error(t('listQuickCreate.validationErrors.general')),
                );
            }
        }
    };

    const handleInputChange =
        (field: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormState((prev) => ({
                ...prev,
                [field]: e.target.value,
            }));

            if (error) setError(null);
        };

    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setFormState((prev) => ({
            ...prev,
            description: e.target.value,
        }));

        if (error) setError(null);
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormState((prev) => ({
            ...prev,
            isPublic: checked,
        }));
    };

    const handleTextareaKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (e.key === ' ') {
            e.preventDefault();

            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            const newText =
                formState.description.substring(0, start) +
                ' ' +
                formState.description.substring(end);

            setFormState((prev) => ({
                ...prev,
                description: newText,
            }));

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 1;
            }, 0);
        }
    };

    return (
        <div className="space-y-2" data-testid="bookmark-page2">
            <div className="bg-primary-light">
                <button
                    type="button"
                    onClick={() => onNavigate?.(0)}
                    className="text-content flex items-center gap-2 px-3 py-2 font-bold"
                    data-testid="new-list-back-button"
                >
                    <ArrowLeftIcon />
                    <Paragraph size="md">
                        {t('listQuickCreate.addList')}
                    </Paragraph>
                </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-3" data-testid="bookmark-page2-form">
                <div className="flex flex-col gap-2">
                    <TextInput
                        type="text"
                        id="list-name"
                        name="name"
                        placeholder={t('listQuickCreate.createListPlaceholder')}
                        className="w-full border p-2 text-sm"
                        value={formState.name}
                        onChange={handleInputChange('name')}
                        autoComplete="off"
                        tabIndex={1000}
                        data-testid="list-name-input"
                    />
                    <textarea
                        id="list-description"
                        name="description"
                        rows={4}
                        placeholder={t('listQuickCreate.addDescPlaceholder')}
                        className="border-border-primary border-opacity-40 bg-background text-content focus:border-primary w-full rounded-md border p-2 text-sm shadow-xs resize-none"
                        value={formState.description}
                        onChange={handleDescriptionChange}
                        onKeyDown={handleTextareaKeyDown}
                        autoComplete="off"
                        tabIndex={1001}
                        data-testid="list-description-input"
                    />
                </div>

                <div>
                    <CustomSwitch
                        checked={formState.isPublic}
                        onCheckedChange={handleSwitchChange}
                        label={t('listQuickCreate.public')}
                        labelShouldPrecede
                        className="w-full"
                        data-testid="list-public-switch"
                    />
                </div>
                {error && (
                    <Paragraph size="sm" className="text-red-600" data-testid="form-error">
                        {error.message}
                    </Paragraph>
                )}

                <PrimaryButton
                    type="submit"
                    className="my-2 flex w-full items-center justify-center rounded-lg text-center capitalize"
                    onClick={handleSubmit}
                    loading={isAddingList}
                    data-testid="create-list-submit-button"
                >
                    {t('listQuickCreate.createListShort')}
                </PrimaryButton>
            </form>
        </div>
    );
};

export default BookmarkPage2;
