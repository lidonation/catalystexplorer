import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import TextInput from '@/Components/atoms/TextInput';
import { ServiceWorkflowParams } from '@/enums/service-workflow-params';
import { StepDetails } from '@/types';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Step2Props {
    stepDetails: StepDetails[];
    activeStep: number;
    serviceHash?: string;
    serviceData?: {
        name?: string;
        email?: string;
        website?: string;
        github?: string;
        linkedin?: string;
        categories?: number[];
        location?: number;
    };
    locations: Array<{
        id: number;
        city: string;
        region: string;
    }>;
    defaults: {
        contact: {
            name: string;
            email: string;
            website?: string;
            github?: string;
            linkedin?: string;
        };
        location?: number;
    };
}

interface PageProps {
    flash: {
        error?: Record<string, string[]>;
        success?: string;
    };
    [key: string]: any;
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    serviceHash,
    serviceData,
    locations,
    defaults,
}) => {
    const form = useForm({
        [ServiceWorkflowParams.SERVICE_HASH]: serviceHash || '',
        [ServiceWorkflowParams.CATEGORIES]:
            serviceData?.categories?.map(String) || [],
        [ServiceWorkflowParams.LOCATION]:
            serviceData?.location || defaults.location || '',
        [ServiceWorkflowParams.NAME]:
            serviceData?.name || defaults.contact.name,
        [ServiceWorkflowParams.EMAIL]:
            serviceData?.email || defaults.contact.email,
        [ServiceWorkflowParams.WEBSITE]:
            serviceData?.website || defaults.contact.website || '',
        [ServiceWorkflowParams.GITHUB]:
            serviceData?.github || defaults.contact.github || '',
        [ServiceWorkflowParams.LINKEDIN]:
            serviceData?.linkedin || defaults.contact.linkedin || '',
    });

    const page = usePage<PageProps>();
    const flashErrors = page.props.flash?.error || {};

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        serviceData?.categories?.map(String) || [],
    );
    const [isFormValid, setIsFormValid] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        website?: string;
    }>({});

    // Separate form for saving contact info
    const contactForm = useForm({
        [ServiceWorkflowParams.SERVICE_HASH]: serviceHash || '',
        [ServiceWorkflowParams.NAME]:
            serviceData?.name || defaults.contact.name,
        [ServiceWorkflowParams.EMAIL]:
            serviceData?.email || defaults.contact.email,
        [ServiceWorkflowParams.WEBSITE]:
            serviceData?.website || defaults.contact.website || '',
        [ServiceWorkflowParams.GITHUB]:
            serviceData?.github || defaults.contact.github || '',
        [ServiceWorkflowParams.LINKEDIN]:
            serviceData?.linkedin || defaults.contact.linkedin || '',
    });

    const { t } = useLaravelReactI18n();

    const prevStep = generateLocalizedRoute('workflows.createService.index', {
        step: activeStep - 1,
        [ServiceWorkflowParams.SERVICE_HASH]: serviceHash,
    });

    useEffect(() => {
        validateForm();
        // Sync contact form data with main form data
        contactForm.setData({
            [ServiceWorkflowParams.SERVICE_HASH]:
                form.data[ServiceWorkflowParams.SERVICE_HASH],
            [ServiceWorkflowParams.NAME]: form.data[ServiceWorkflowParams.NAME],
            [ServiceWorkflowParams.EMAIL]:
                form.data[ServiceWorkflowParams.EMAIL],
            [ServiceWorkflowParams.WEBSITE]:
                form.data[ServiceWorkflowParams.WEBSITE],
            [ServiceWorkflowParams.GITHUB]:
                form.data[ServiceWorkflowParams.GITHUB],
            [ServiceWorkflowParams.LINKEDIN]:
                form.data[ServiceWorkflowParams.LINKEDIN],
        });
    }, [form.data, selectedCategories]);

    const validateEmail = (email: string): boolean => {
        if (!email) return true; // Empty email is valid (not required for some fields)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateWebsiteUrl = (url: string): boolean => {
        if (!url) return true; // Empty URL is valid (not required)

        // If URL doesn't start with protocol, add https://
        let urlToValidate = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            urlToValidate = 'https://' + url;
        }

        try {
            const urlObj = new URL(urlToValidate);
            // Check if it's a valid URL with http or https protocol and has a valid hostname
            return (
                (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') &&
                urlObj.hostname.length > 0 &&
                urlObj.hostname.includes('.')
            );
        } catch {
            return false;
        }
    };

    const validateForm = () => {
        const errors: { email?: string; website?: string } = {};

        // Validate email
        if (
            form.data[ServiceWorkflowParams.EMAIL] &&
            !validateEmail(form.data[ServiceWorkflowParams.EMAIL])
        ) {
            errors.email = t(
                'workflows.createService.step2.validation.emailInvalid',
            );
        }

        // Validate website URL
        if (
            form.data[ServiceWorkflowParams.WEBSITE] &&
            !validateWebsiteUrl(form.data[ServiceWorkflowParams.WEBSITE])
        ) {
            errors.website = t(
                'workflows.createService.step2.validation.websiteInvalid',
            );
        }

        setValidationErrors(errors);

        setIsFormValid(
            !!form.data[ServiceWorkflowParams.NAME] &&
                !!form.data[ServiceWorkflowParams.EMAIL] &&
                validateEmail(form.data[ServiceWorkflowParams.EMAIL]) &&
                (!form.data[ServiceWorkflowParams.WEBSITE] ||
                    validateWebsiteUrl(
                        form.data[ServiceWorkflowParams.WEBSITE],
                    )) &&
                !!form.data[ServiceWorkflowParams.SERVICE_HASH],
        );
    };

    const handleInputChange = (field: string, value: string) => {
        form.setData(field as keyof typeof form.data, value);
    };

    const submitForm = () => {
        form.post(
            generateLocalizedRoute(
                'workflows.createService.saveContactAndLocation',
            ),
            {
                preserveScroll: true,
                onSuccess: () => {},
                onError: () => {},
            },
        );
    };

    const saveContactInfo = () => {
        contactForm.post(
            generateLocalizedRoute('workflows.createService.saveContactInfo'),
            {
                preserveScroll: true,
                onSuccess: () => {},
                onError: () => {},
            },
        );
    };

    return (
        <WorkflowLayout
            title="Create Service"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background max-h-[60vh] w-full overflow-y-auto p-6 lg:p-8">
                    <div className="mx-auto w-full space-y-6 px-4">
                        {/* Success Message */}
                        {form.recentlySuccessful && (
                            <div
                                className="p-4"
                                data-testid="service-contact-save-success"
                            >
                                <div className="flex">
                                    <div className="ml-3">
                                        <Paragraph className="text-success text-sm font-medium">
                                            {t(
                                                'workflows.createService.step2.serviceCreatedSuccess',
                                            )}
                                        </Paragraph>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Service Information Form */}
                        <div
                            className="space-y-6"
                            data-testid="service-contact-information-form"
                        >
                            {/* Name Field */}
                            <div data-testid="service-contact-name-field">
                                <Paragraph
                                    size="xs"
                                    className="mb-2 block font-medium"
                                >
                                    {t('workflows.createService.step2.name')}
                                    <span className="text-error">*</span>
                                </Paragraph>
                                <TextInput
                                    value={
                                        form.data[ServiceWorkflowParams.NAME]
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            ServiceWorkflowParams.NAME,
                                            e.target.value,
                                        )
                                    }
                                    className={`focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                                        flashErrors[ServiceWorkflowParams.NAME]
                                            ? 'border-error'
                                            : 'border-gray-persist/[50%]'
                                    }`}
                                    placeholder=""
                                    required
                                    data-testid="service-contact-name-input"
                                />
                                {flashErrors[ServiceWorkflowParams.NAME] && (
                                    <Paragraph
                                        className="text-error mt-1 text-sm"
                                        data-testid="service-contact-name-flash-error"
                                    >
                                        {Array.isArray(
                                            flashErrors[
                                                ServiceWorkflowParams.NAME
                                            ],
                                        )
                                            ? flashErrors[
                                                  ServiceWorkflowParams.NAME
                                              ][0]
                                            : flashErrors[
                                                  ServiceWorkflowParams.NAME
                                              ]}
                                    </Paragraph>
                                )}
                            </div>

                            {/* Email and Website URL Row */}
                            <div
                                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                                data-testid="service-contact-email-website-row"
                            >
                                {/* Email Field */}
                                <div data-testid="service-contact-email-field">
                                    <Paragraph
                                        size="xs"
                                        className="mb-2 block font-medium"
                                    >
                                        {t(
                                            'workflows.createService.step2.emailAddress',
                                        )}
                                        <span className="text-error">*</span>
                                    </Paragraph>
                                    <TextInput
                                        type="email"
                                        value={
                                            form.data[
                                                ServiceWorkflowParams.EMAIL
                                            ]
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                ServiceWorkflowParams.EMAIL,
                                                e.target.value,
                                            )
                                        }
                                        className={`focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                                            validationErrors.email ||
                                            flashErrors[
                                                ServiceWorkflowParams.EMAIL
                                            ]
                                                ? 'border-error'
                                                : 'border-gray-persist/[50%]'
                                        }`}
                                        placeholder=""
                                        required
                                        data-testid="service-contact-email-input"
                                    />
                                    {validationErrors.email && (
                                        <Paragraph
                                            className="text-error mt-1 text-sm"
                                            data-testid="service-contact-email-error"
                                        >
                                            {validationErrors.email}
                                        </Paragraph>
                                    )}
                                    {flashErrors[
                                        ServiceWorkflowParams.EMAIL
                                    ] && (
                                        <Paragraph
                                            className="text-error mt-1 text-sm"
                                            data-testid="service-contact-email-flash-error"
                                        >
                                            {Array.isArray(
                                                flashErrors[
                                                    ServiceWorkflowParams.EMAIL
                                                ],
                                            )
                                                ? flashErrors[
                                                      ServiceWorkflowParams
                                                          .EMAIL
                                                  ][0]
                                                : flashErrors[
                                                      ServiceWorkflowParams
                                                          .EMAIL
                                                  ]}
                                        </Paragraph>
                                    )}
                                </div>

                                {/* Website URL Field */}
                                <div data-testid="service-contact-website-field">
                                    <Paragraph
                                        size="xs"
                                        className="mb-2 block font-medium"
                                    >
                                        {t(
                                            'workflows.createService.step2.websiteUrl',
                                        )}
                                    </Paragraph>
                                    <TextInput
                                        type="url"
                                        value={
                                            form.data[
                                                ServiceWorkflowParams.WEBSITE
                                            ]
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                ServiceWorkflowParams.WEBSITE,
                                                e.target.value,
                                            )
                                        }
                                        className={`focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                                            validationErrors.website ||
                                            flashErrors[
                                                ServiceWorkflowParams.WEBSITE
                                            ]
                                                ? 'border-error'
                                                : 'border-gray-persist/[50%]'
                                        }`}
                                        placeholder=""
                                        data-testid="service-contact-website-input"
                                    />
                                    {validationErrors.website && (
                                        <Paragraph
                                            className="text-error mt-1 text-sm"
                                            data-testid="service-contact-website-error"
                                        >
                                            {validationErrors.website}
                                        </Paragraph>
                                    )}
                                    {flashErrors[
                                        ServiceWorkflowParams.WEBSITE
                                    ] && (
                                        <Paragraph
                                            className="text-error mt-1 text-sm"
                                            data-testid="service-contact-website-flash-error"
                                        >
                                            {Array.isArray(
                                                flashErrors[
                                                    ServiceWorkflowParams
                                                        .WEBSITE
                                                ],
                                            )
                                                ? flashErrors[
                                                      ServiceWorkflowParams
                                                          .WEBSITE
                                                  ][0]
                                                : flashErrors[
                                                      ServiceWorkflowParams
                                                          .WEBSITE
                                                  ]}
                                        </Paragraph>
                                    )}
                                </div>
                            </div>

                            {/* GitHub and LinkedIn Row */}
                            <div
                                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                                data-testid="service-contact-social-row"
                            >
                                {/* GitHub Field */}
                                <div data-testid="service-contact-github-field">
                                    <Paragraph
                                        size="xs"
                                        className="mb-2 block font-medium"
                                    >
                                        {t(
                                            'workflows.createService.step2.github',
                                        )}
                                    </Paragraph>
                                    <TextInput
                                        value={
                                            form.data[
                                                ServiceWorkflowParams.GITHUB
                                            ]
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                ServiceWorkflowParams.GITHUB,
                                                e.target.value,
                                            )
                                        }
                                        className={`focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                                            flashErrors[
                                                ServiceWorkflowParams.GITHUB
                                            ]
                                                ? 'border-error'
                                                : 'border-gray-persist/[50%]'
                                        }`}
                                        placeholder=""
                                        data-testid="service-contact-github-input"
                                    />
                                    {flashErrors[
                                        ServiceWorkflowParams.GITHUB
                                    ] && (
                                        <Paragraph
                                            className="text-error mt-1 text-sm"
                                            data-testid="service-contact-github-flash-error"
                                        >
                                            {Array.isArray(
                                                flashErrors[
                                                    ServiceWorkflowParams.GITHUB
                                                ],
                                            )
                                                ? flashErrors[
                                                      ServiceWorkflowParams
                                                          .GITHUB
                                                  ][0]
                                                : flashErrors[
                                                      ServiceWorkflowParams
                                                          .GITHUB
                                                  ]}
                                        </Paragraph>
                                    )}
                                </div>

                                {/* LinkedIn Field */}
                                <div data-testid="service-contact-linkedin-field">
                                    <Paragraph
                                        size="xs"
                                        className="mb-2 block font-medium"
                                    >
                                        {t(
                                            'workflows.createService.step2.linkedin',
                                        )}
                                    </Paragraph>
                                    <TextInput
                                        value={
                                            form.data[
                                                ServiceWorkflowParams.LINKEDIN
                                            ]
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                ServiceWorkflowParams.LINKEDIN,
                                                e.target.value,
                                            )
                                        }
                                        className={`focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                                            flashErrors[
                                                ServiceWorkflowParams.LINKEDIN
                                            ]
                                                ? 'border-error'
                                                : 'border-gray-persist/[50%]'
                                        }`}
                                        placeholder=""
                                        data-testid="service-contact-linkedin-input"
                                    />
                                    {flashErrors[
                                        ServiceWorkflowParams.LINKEDIN
                                    ] && (
                                        <Paragraph
                                            className="text-error mt-1 text-sm"
                                            data-testid="service-contact-linkedin-flash-error"
                                        >
                                            {Array.isArray(
                                                flashErrors[
                                                    ServiceWorkflowParams
                                                        .LINKEDIN
                                                ],
                                            )
                                                ? flashErrors[
                                                      ServiceWorkflowParams
                                                          .LINKEDIN
                                                  ][0]
                                                : flashErrors[
                                                      ServiceWorkflowParams
                                                          .LINKEDIN
                                                  ]}
                                        </Paragraph>
                                    )}
                                </div>
                            </div>

                            {/* Add Network Button */}
                            <div
                                className="flex justify-end"
                                data-testid="service-contact-save-section"
                            >
                                <div className="flex flex-col items-end">
                                    <PrimaryButton
                                        type="button"
                                        onClick={saveContactInfo}
                                        disabled={contactForm.processing}
                                        className="bg-primary hover:bg-primary/80 disabled:bg-primary/60 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed"
                                        data-testid="service-contact-save-button"
                                    >
                                        {contactForm.processing
                                            ? t(
                                                  'workflows.createService.step2.saving',
                                              )
                                            : t(
                                                  'workflows.createService.step2.addNetwork',
                                              )}
                                    </PrimaryButton>

                                    {/* Display form errors if any */}
                                    {Object.keys(contactForm.errors).length >
                                        0 && (
                                        <div
                                            className="text-error mt-2 text-sm"
                                            data-testid="service-contact-save-error"
                                        >
                                            {
                                                Object.values(
                                                    contactForm.errors,
                                                )[0]
                                            }
                                        </div>
                                    )}

                                    {/* Success message - you can add this via flash messages */}
                                    {contactForm.recentlySuccessful && (
                                        <div
                                            className="mt-2"
                                            data-testid="service-contact-save-success-message"
                                        >
                                            <Paragraph
                                                size="sm"
                                                className="text-success"
                                            >
                                                {t(
                                                    'workflows.createService.step2.contactInfoSavedSuccess',
                                                )}
                                            </Paragraph>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Field */}
                            <div data-testid="service-location-field">
                                <Paragraph
                                    size="xs"
                                    className="mb-2 block font-medium"
                                >
                                    {t(
                                        'workflows.createService.step2.location',
                                    )}
                                </Paragraph>
                                <TextInput
                                    value={
                                        form.data[
                                            ServiceWorkflowParams.LOCATION
                                        ]
                                    }
                                    onChange={(e) =>
                                        handleInputChange(
                                            ServiceWorkflowParams.LOCATION,
                                            e.target.value,
                                        )
                                    }
                                    className={`focus:ring-primary focus:border-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                                        flashErrors[
                                            ServiceWorkflowParams.LOCATION
                                        ]
                                            ? 'border-error'
                                            : 'border-gray-persist/[50%]'
                                    }`}
                                    placeholder={t(
                                        'workflows.createService.step2.enterCity',
                                    )}
                                    data-testid="service-location-input"
                                />
                                {flashErrors[
                                    ServiceWorkflowParams.LOCATION
                                ] && (
                                    <Paragraph
                                        className="text-error mt-1 text-sm"
                                        data-testid="service-location-flash-error"
                                    >
                                        {Array.isArray(
                                            flashErrors[
                                                ServiceWorkflowParams.LOCATION
                                            ],
                                        )
                                            ? flashErrors[
                                                  ServiceWorkflowParams.LOCATION
                                              ][0]
                                            : flashErrors[
                                                  ServiceWorkflowParams.LOCATION
                                              ]}
                                    </Paragraph>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Content>
            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="bg-primary hover:bg-primary/[0.8] mb-8 inline-flex items-center rounded-md px-4 py-3 text-sm font-medium text-white transition-colors"
                    data-testid="service-step2-previous-button"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryButton
                    className="bg-primary hover:bg-primary/[0.8] mb-8 inline-flex items-center rounded-md px-4 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!isFormValid || form.processing}
                    onClick={submitForm}
                    data-testid="service-step2-submit-button"
                >
                    <span>
                        {t('workflows.createService.step2.submitService')}
                    </span>
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
