import InputError from '@/Components/InputError';
import Checkbox from '@/Components/atoms/Checkbox';
import LanguageSelector from '@/Components/atoms/LanguageSelector';
import TextInput from '@/Components/atoms/TextInput';
import Textarea from '@/Components/atoms/Textarea';
import { useLanguageDetection } from '@/Hooks/useLanguageDetection';
import { FormDataConvertible } from '@inertiajs/core';
import { InertiaFormProps, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';

export interface DrepSignupFormFields
    extends Record<string, FormDataConvertible> {
    name: string;
    email: string;
    bio: string;
    link: string;
    willMaintain: boolean;
    locale: string;
}

interface DrepSignupFormProps {
    setIsValid: (valid: boolean) => void;
    form: InertiaFormProps<DrepSignupFormFields>;
    savedLocale?: string;
}

export interface DrepSignupFormHandles {
    getFormData: InertiaFormProps<DrepSignupFormFields>;
    validateLanguages: () => { isValid: boolean; message?: string };
}

const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setData: any,
    data: any,
) => {
    setData(e.target.name as keyof typeof data, e.target.value);
};

const DrepSignupForm = forwardRef<DrepSignupFormHandles, DrepSignupFormProps>(
    ({ setIsValid, form, savedLocale }, ref) => {
        const typedForm = form as InertiaFormProps<DrepSignupFormFields>;
        const { data } = typedForm;
        const setData = typedForm.setData as any;
        const errors = typedForm.errors as Partial<
            Record<keyof DrepSignupFormFields, string>
        >;
        const { locale } = usePage().props as any;

        const [currentLocale, setCurrentLocale] = useState<string>(locale);
        const [languageWarning, setLanguageWarning] = useState<string>('');

        const { getSuggestedLanguage, validateLanguageConsistency } =
            useLanguageDetection();
        const { t } = useLaravelReactI18n();

        const handleLanguageChange = useCallback(
            (locale: string) => {
                setCurrentLocale(locale);
                setData('locale', locale);
            },
            [setData],
        );

        const validateLanguages = useCallback(() => {
            const validation = validateLanguageConsistency(
                { bio: data.bio },
                currentLocale,
            );

            if (!validation.isValid) {
                setLanguageWarning(
                    validation.message || 'Language mismatch detected',
                );
                return { isValid: false, message: validation.message };
            }

            setLanguageWarning('');
            return { isValid: true };
        }, [data.bio, currentLocale, validateLanguageConsistency]);

        useImperativeHandle(ref, () => ({
            getFormData: form,
            validateLanguages,
        }));

        useEffect(() => {
            if (typedForm.data.email.length && typedForm.data.name.length) {
                setIsValid(true);
            }
        }, [typedForm.data.email, typedForm.data.name, setIsValid]);

        // Ensure locale is set in form data
        useEffect(() => {
            if (data.locale !== currentLocale) {
                setData('locale', currentLocale);
            }
        }, [currentLocale, data.locale, setData, locale]);

        useEffect(() => {
            setCurrentLocale(locale);
        }, [locale]);

        return (
            <div className="rounded-lg p-4 lg:p-8">
                <form>
                    {/* Name */}
                    <div className="mt-3">
                        <label htmlFor="name" className="text-sm">
                            {t('profileWorkflow.name')}
                        </label>
                        <TextInput
                            id="name"
                            name="name"
                            placeholder={t('name')}
                            value={typedForm.data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="mt-3">
                        <label htmlFor="email" className="text-sm">
                            {t('profileWorkflow.email')}
                        </label>
                        <TextInput
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t('email')}
                            value={typedForm.data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full"
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Language Display */}
                    <div className="mt-3">
                        <LanguageSelector
                            selectedLanguage={currentLocale}
                            onLanguageChange={handleLanguageChange}
                            className=""
                        />
                        {languageWarning && (
                            <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm text-amber-800">
                                    ⚠️ {languageWarning}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="mt-3">
                        <label htmlFor="bio" className="text-sm">
                            {t('profileWorkflow.bio')}
                        </label>
                        <Textarea
                            id="bio"
                            name="bio"
                            required
                            minLengthEnforced
                            value={typedForm.data.bio}
                            onChange={(e) => setData('bio', e.target.value)}
                            className="h-30 w-full rounded-lg px-4 py-2"
                        />
                        <InputError message={errors.bio} />
                    </div>

                    {/* link */}
                    <div>
                        <label htmlFor="link" className="text-sm">
                            {t('link')}
                        </label>
                        <TextInput
                            placeholder={t('link')}
                            id="link"
                            name="link"
                            value={typedForm.data.link}
                            onChange={(e) => setData('link', e.target.value)}
                            className="w-full"
                        />
                        <InputError message={errors.link} />
                    </div>

                    <div className="mt-3 flex items-center">
                        <Checkbox
                            name="willMaintain"
                            id="willMaintain"
                            checked={data.willMaintain}
                            onChange={(e) =>
                                setData('willMaintain', !data.willMaintain)
                            }
                            className="text-content-accent bg-background checked:bg-primary checked:hover:bg-primary focus:border-primary focus:ring-primary checked:focus:bg-primary mr-2 h-4 w-4 shadow-xs focus:border"
                        />
                        <label
                            htmlFor="willMaintain"
                            className={`text-sm ${!data.willMaintain && errors.willMaintain ? 'text-danger-strong' : 'text-slate'}`}
                        >
                            {t('workflows.catalystDrepSignup.willMaintain')}
                        </label>
                    </div>
                </form>
            </div>
        );
    },
);

export default DrepSignupForm;
