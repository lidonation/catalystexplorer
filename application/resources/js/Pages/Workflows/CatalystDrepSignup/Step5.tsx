import ErrorDisplay from '@/Components/atoms/ErrorDisplay';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Textarea from '@/Components/atoms/Textarea';
import InputError from '@/Components/InputError';
import { LOCALE_MAPPING } from '@/constants/locales';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import useLanguageDetection from '@/hooks/useLanguageDetection';
import { StepDetails } from '@/types';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { InertiaFormProps, useForm, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import IpfsSuccessDisplay from './partials/IpfsSuccessDisplay';
import CatalysDrepData = App.DataTransferObjects.CatalystDrepData;

interface Step5Props {
    catalystDrep: CatalysDrepData;
    stepDetails: StepDetails[];
    activeStep: number;
    savedLocale: string;
}

interface PageProps {
    flash?: {
        success?:
            | string
            | {
                  ipfs_cid: string;
                  gateway_url: string;
                  filename: string;
              };
    };
    errorBags?: {
        default?: {
            error?: string[];
        };
    };
    [key: string]: any;
}

export interface DrepSignupFormFields {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    link?: string | null;
    bio?: string | null;
    motivation?: string | null;
    qualifications?: string | null;
    objective?: string | null;
    stake_address?: string | null;
    voting_power?: number | null;
    last_active?: string | null;
    status?: string | null;
    locale?: string | null;
    [key: string]: any;
}

export interface DrepSignupFormHandles {
    getFormData: InertiaFormProps<DrepSignupFormFields>;
}

const step5: React.FC<Step5Props> = ({
    stepDetails,
    activeStep,
    catalystDrep,
    savedLocale,
}) => {
    const { t } = useLaravelReactI18n();
    const page = usePage<PageProps>();
    const { userAddress } = useConnectWallet();
    const [languageWarning, setLanguageWarning] = useState<string>('');
    const [ipfsData, setIpfsData] = useState<{
        cid: string;
        gatewayUrl: string;
        filename: string;
    } | null>(null);

    const { getSuggestedLanguage, validateLanguageConsistency } =
        useLanguageDetection();

    const form = useForm({
        ...catalystDrep,
        locale: savedLocale,
    } as any);

    const { data, setData } = form;

    const localizedRoute = useLocalizedRoute;

    // Check for flash success data on component mount
    useEffect(() => {
        const flashSuccess = page.props.flash?.success;
        if (
            flashSuccess &&
            typeof flashSuccess === 'object' &&
            'ipfs_cid' in flashSuccess
        ) {
            setIpfsData({
                cid: flashSuccess.ipfs_cid,
                gatewayUrl: flashSuccess.gateway_url,
                filename: flashSuccess.filename,
            });
        }
    }, [page.props.flash]);

    const validateLanguages = useCallback(() => {
        const validation = validateLanguageConsistency(
            {
                objective: data.objective || '',
                motivation: data.motivation || '',
                qualifications: data.qualifications || '',
            },
            savedLocale,
        );

        if (!validation.isValid) {
            setLanguageWarning(
                validation.message ||
                    'Language mismatch detected between fields',
            );
            return false;
        }

        setLanguageWarning('');
        return true;
    }, [
        data.objective,
        data.motivation,
        data.qualifications,
        savedLocale,
        validateLanguageConsistency,
    ]);

    const submitForm = () => {
        // Validate languages before submission
        if (!validateLanguages()) {
            return;
        }

        form.data.locale = savedLocale;
        form.data.paymentAddress = userAddress;

        form.post(
            generateLocalizedRoute(
                'workflows.drepSignUp.publishPlatformStatement',
                {
                    catalystDrep: catalystDrep.id,
                },
            ),
            {
                preserveScroll: true,
                onSuccess: () => {
                    // The IPFS data will be handled by the useEffect that watches for flash messages
                    console.log('Platform statement published successfully');
                },
                onError: (errors: any) => {
                    console.error(
                        'Failed to publish platform statement to IPFS:',
                        errors,
                    );
                    for (const key in errors) {
                        (form as any).setError(key, errors[key]);
                    }
                },
            },
        );
    };

    const prevStep = localizedRoute('workflows.drepSignUp.index', {
        step: activeStep - 1,
    });

    const nextStep = localizedRoute('dreps.list');

    return (
        <WorkflowLayout
            title="Drep SignUp"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
            wrapperClassName="!h-auto"
            contentClassName="!max-h-none"
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="@container mx-auto mb-6 w-full max-w-2xl px-4">
                    {/* Error Messages */}
                    <ErrorDisplay />

                    {/* IPFS Results */}
                    {ipfsData && <IpfsSuccessDisplay ipfsData={ipfsData} />}

                    {/* Display Selected Language */}
                    <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-2">
                            <Paragraph className="text-sm font-medium text-slate-700">
                                {t('Selected Language')}:
                            </Paragraph>
                            <Paragraph className="text-sm font-semibold text-slate-900">
                                {LOCALE_MAPPING[
                                    savedLocale as keyof typeof LOCALE_MAPPING
                                ]?.native || savedLocale}
                            </Paragraph>
                        </div>
                    </div>

                    <div className="bg-primary-light mb-6 rounded-lg p-4 text-center">
                        <p className="text-slate-500">
                            {t(
                                'workflows.catalystDrepSignup.platformStatementMsg',
                            )}
                        </p>
                    </div>

                    <form className="mb-8 space-y-6">
                        {languageWarning && (
                            <div className="bg-error-light border-error mb-6 rounded-md border p-4">
                                <p className="text-error text-sm">
                                    {languageWarning}
                                </p>
                            </div>
                        )}

                        {/* Bio */}
                        <div className="mt-3">
                            <label htmlFor="bio" className="mb-1 font-bold">
                                {t('workflows.catalystDrepSignup.objectives')}
                            </label>
                            <Textarea
                                id="objectives"
                                name="objectives"
                                placeholder={t(
                                    'workflows.catalystDrepSignup.objectivesPlaceholder',
                                )}
                                required
                                minLengthEnforced
                                value={form.data.objective ?? ''}
                                onChange={(e) =>
                                    (form as any).setData(
                                        'objective',
                                        e.target.value,
                                    )
                                }
                                className="h-30 w-full rounded-lg px-4 py-2"
                            />
                            <InputError
                                message={(form.errors as any).objective}
                            />
                        </div>

                        {/* Bio */}
                        <div className="mt-3">
                            <label
                                htmlFor="motivations"
                                className="mb-1 font-bold"
                            >
                                {t('workflows.catalystDrepSignup.motivations')}
                            </label>
                            <Textarea
                                id="motivations"
                                name="motivations"
                                placeholder={t(
                                    'workflows.catalystDrepSignup.motivationsPlaceholder',
                                )}
                                required
                                minLengthEnforced
                                value={form.data.motivation ?? ''}
                                onChange={(e) =>
                                    (form as any).setData(
                                        'motivation',
                                        e.target.value,
                                    )
                                }
                                className="h-30 w-full rounded-lg px-4 py-2"
                            />
                            <InputError
                                message={(form.errors as any).motivation}
                            />
                        </div>

                        {/* Bio */}
                        <div className="mt-3">
                            <label
                                htmlFor="qualifications"
                                className="mb-1 font-bold"
                            >
                                {t(
                                    'workflows.catalystDrepSignup.qualifications',
                                )}
                            </label>
                            <Textarea
                                id="qualifications"
                                name="qualifications"
                                required
                                placeholder={t(
                                    'workflows.catalystDrepSignup.qualificationsPlaceholder',
                                )}
                                minLengthEnforced
                                value={form.data.qualifications ?? ''}
                                onChange={(e) =>
                                    (form as any).setData(
                                        'qualifications',
                                        e.target.value,
                                    )
                                }
                                className="h-30 w-full rounded-lg px-4 py-2"
                            />
                            <InputError
                                message={(form.errors as any).qualifications}
                            />
                        </div>
                        <PrimaryButton
                            onClick={() => submitForm()}
                            type="button"
                            className="w-full text-sm lg:px-8 lg:py-2"
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                <>
                                    {t(
                                        'workflows.catalystDrepSignup.publishing',
                                    )}
                                </>
                            ) : (
                                t(
                                    'workflows.catalystDrepSignup.submitStatementToIpfs',
                                )
                            )}
                        </PrimaryButton>
                    </form>
                </div>
                <div className="flex items-center justify-between px-20 py-8">
                    <PrimaryLink
                        href={prevStep}
                        className="text-sm lg:px-8 lg:py-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span>{t('Previous')}</span>
                    </PrimaryLink>

                    <PrimaryLink
                        className="text-sm lg:px-8 lg:py-2"
                        disabled={!ipfsData?.cid}
                        href={nextStep}
                    >
                        <span>{t('Next')}</span>
                        <ChevronRight className="h-4 w-4" />
                    </PrimaryLink>
                </div>
            </Content>
        </WorkflowLayout>
    );
};
