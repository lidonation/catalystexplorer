import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import CustomSwitch from '@/Components/atoms/Switch';
import TextInput from '@/Components/atoms/TextInput';
import ArrowLeftIcon from '@/Components/svgs/ArrowLeft';
import { useList } from '@/Context/ListContext';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { TransitionListPageProps } from '../../../../../../types/general';

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
    const { t } = useTranslation();
    const { addList, isAddingList } = useList();
    const [error, setError] = useState<Error | null>(null);
    const [formState, setFormState] = useState<FormState>({
        name: '',
        description: '',
        isPublic: false,
    });

    const handleSubmit = async () => {
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
                const firstError = error.errors[0];
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

    const handleSwitchChange = (checked: boolean) => {
        setFormState((prev) => ({
            ...prev,
            isPublic: checked,
        }));
    };

    return (
        <div className="space-y-2">
            <div className="bg-primary-light">
                <button
                    onClick={() => onNavigate?.(0)}
                    className="text-content flex items-center gap-2 px-3 py-2 font-bold"
                >
                    <ArrowLeftIcon />
                    <Paragraph size="md">
                        {t('listQuickCreate.addList')}
                    </Paragraph>
                </button>
            </div>
            <section className="flex flex-col gap-3 px-3">
                <div className="flex flex-col gap-2">
                    <TextInput
                        type="text"
                        placeholder={t('listQuickCreate.createListPlaceholder')}
                        className="w-full border p-2 text-sm"
                        value={formState.name}
                        onChange={handleInputChange('name')}
                    />
                    <textarea
                        placeholder={t('listQuickCreate.addDescPlaceholder')}
                        className="border-border-primary border-opacity-40 bg-background text-content focus:border-primary w-full rounded-md border p-2 text-sm shadow-xs"
                        value={formState.description}
                        onChange={handleInputChange('description')}
                    />
                </div>

                <div>
                    <CustomSwitch
                        checked={formState.isPublic}
                        onCheckedChange={handleSwitchChange}
                        label={t('listQuickCreate.public')}
                        labelShouldPrecede
                        className="w-full"
                    />
                </div>
                {error && (
                    <Paragraph size="sm" className="text-red-600">
                        {error.message}
                    </Paragraph>
                )}

                <PrimaryButton
                    className="my-2 flex w-full items-center justify-center rounded-lg text-center capitalize"
                    onClick={handleSubmit}
                    loading={isAddingList}
                >
                    {t('listQuickCreate.createListShort')}
                </PrimaryButton>
            </section>
        </div>
    );
};

export default BookmarkPage2;
