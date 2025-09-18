import InputError from '@/Components/InputError';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import TextInput from '@/Components/atoms/TextInput';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { FormDataConvertible } from '@inertiajs/core';
import { InertiaFormProps } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { toast } from 'react-toastify';

export interface CatalystProfileFormFields
    extends Record<string, FormDataConvertible> {
    name: string;
    username: string;
    catalystId: string;
    stakeAddress: string;
}

interface CatalystProfileFormProps {
    setIsValid: (valid: boolean) => void;
    form: InertiaFormProps<CatalystProfileFormFields>;
}

export interface CatalystProfileFormHandles {
    getFormData: InertiaFormProps<CatalystProfileFormFields>;
}

const CatalystProfileForm = forwardRef<
    CatalystProfileFormHandles,
    CatalystProfileFormProps
>(({ setIsValid, form }, ref) => {
    const typedForm = form as InertiaFormProps<CatalystProfileFormFields>;
    const { data } = typedForm;
    const setData = typedForm.setData as any;
    const errors = typedForm.errors as Partial<
        Record<keyof CatalystProfileFormFields, string>
    >;

    const { t } = useLaravelReactI18n();

    useImperativeHandle(ref, () => ({
        getFormData: form,
    }));

    useEffect(() => {
        if (typedForm.data.username.length && typedForm.data.name.length) {
            setIsValid(true);
        }
    }, [typedForm.data.email, typedForm.data.name]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                console.log('Copied to clipboard:', text);
                toast.success(t('copied'), {
                    className: 'bg-background text-content',
                    toastId: 'copied-to-clipboard',
                });
            })
            .catch((err) => {
                console.error('Failed to copy:', err);
            });
    };

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
    };
    
    return (
        <div className="rounded-lg p-4 lg:p-8">
            <form>
                <div className="mt-3">
                    <label htmlFor="name" className="text-sm">
                        {t('profileWorkflow.name')}
                    </label>
                    <TextInput
                        id="name"
                        name="name"
                        value={typedForm.data.name}
                        onChange={(e) => {
                            e.preventDefault;
                            setData('name', e.target.value);
                        }}
                        className="border-dark w-full"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="mt-3 flex flex-col md:flex-row gap-3">
                    <div className="w-full">
                        <label className="text-sm">
                            {t('workflows.claimCatalystProfile.catalystId')}
                        </label>
                        <div className="border px-3 py-2 border-dark/40 bg-gray-persist/5 flex w-full gap-2 rounded-md">
                            <div>
                                {formatAddress(typedForm.data.catalystId ?? '')}
                            </div>
                            <Button
                                type="button"
                                onClick={() =>
                                    copyToClipboard(
                                        typedForm.data.catalystId ?? '',
                                    )
                                }
                                ariaLabel={t('copyToClipboard')}
                            >
                                <CopyIcon
                                    width={16}
                                    height={16}
                                    className="text-gray-persist"
                                />
                            </Button>
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="text-sm">
                            {t('transactions.table.stakeAddress')}
                        </label>
                        <div className="border px-3 py-2 border-dark/40 bg-gray-persist/5 flex w-full gap-2 rounded-md">
                            <Paragraph>
                                {formatAddress(typedForm.data.stakeAddress ?? '')}
                            </Paragraph>
                            <Button
                                type="button"
                                onClick={() =>
                                    copyToClipboard(
                                        typedForm.data.stakeAddress ?? '',
                                    )
                                }
                                ariaLabel={t('copyToClipboard')}
                            >
                                <CopyIcon
                                    width={16}
                                    height={16}
                                    className="text-gray-persist"
                                />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-3">
                    <label htmlFor="username" className="text-sm">
                        {t('workflows.claimCatalystProfile.username')}
                    </label>
                    <TextInput
                        id="username"
                        name="username"
                        type="text"
                        value={typedForm.data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        className="border-dark w-full"
                        required
                    />
                    <InputError message={errors.username} />
                </div>
            </form>
        </div>
    );
});

export default CatalystProfileForm;
