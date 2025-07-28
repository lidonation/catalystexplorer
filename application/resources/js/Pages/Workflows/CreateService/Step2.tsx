import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import { StepDetails } from '@/types';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import { useLaravelReactI18n } from "laravel-react-i18n";
import { useForm } from '@inertiajs/react';
import { ServiceWorkflowParams } from '@/enums/service-workflow-params';

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
        [ServiceWorkflowParams.CATEGORIES]: serviceData?.categories?.map(String) || [],
        [ServiceWorkflowParams.LOCATION]: serviceData?.location || defaults.location || '',
        [ServiceWorkflowParams.NAME]: serviceData?.name || defaults.contact.name,
        [ServiceWorkflowParams.EMAIL]: serviceData?.email || defaults.contact.email,
        [ServiceWorkflowParams.WEBSITE]: serviceData?.website || defaults.contact.website || '',
        [ServiceWorkflowParams.GITHUB]: serviceData?.github || defaults.contact.github || '',
        [ServiceWorkflowParams.LINKEDIN]: serviceData?.linkedin || defaults.contact.linkedin || '',
    });

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        serviceData?.categories?.map(String) || []
    );
    const [isFormValid, setIsFormValid] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        website?: string;
    }>({});

    // Separate form for saving contact info
    const contactForm = useForm({
        [ServiceWorkflowParams.SERVICE_HASH]: serviceHash || '',
        [ServiceWorkflowParams.NAME]: serviceData?.name || defaults.contact.name,
        [ServiceWorkflowParams.EMAIL]: serviceData?.email || defaults.contact.email,
        [ServiceWorkflowParams.WEBSITE]: serviceData?.website || defaults.contact.website || '',
        [ServiceWorkflowParams.GITHUB]: serviceData?.github || defaults.contact.github || '',
        [ServiceWorkflowParams.LINKEDIN]: serviceData?.linkedin || defaults.contact.linkedin || '',
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
            [ServiceWorkflowParams.SERVICE_HASH]: form.data[ServiceWorkflowParams.SERVICE_HASH],
            [ServiceWorkflowParams.NAME]: form.data[ServiceWorkflowParams.NAME],
            [ServiceWorkflowParams.EMAIL]: form.data[ServiceWorkflowParams.EMAIL],
            [ServiceWorkflowParams.WEBSITE]: form.data[ServiceWorkflowParams.WEBSITE],
            [ServiceWorkflowParams.GITHUB]: form.data[ServiceWorkflowParams.GITHUB],
            [ServiceWorkflowParams.LINKEDIN]: form.data[ServiceWorkflowParams.LINKEDIN],
        });
    }, [form.data, selectedCategories]);

    const validateEmail = (email: string): boolean => {
        if (!email) return true; // Empty email is valid (not required for some fields)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateWebsiteUrl = (url: string): boolean => {
        if (!url) return true; // Empty URL is valid (not required)
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const validateForm = () => {
        const errors: { email?: string; website?: string } = {};
        
        // Validate email
        if (form.data[ServiceWorkflowParams.EMAIL] && !validateEmail(form.data[ServiceWorkflowParams.EMAIL])) {
            errors.email = t('workflows.createService.step2.validation.emailInvalid');
        }
        
        // Validate website URL
        if (form.data[ServiceWorkflowParams.WEBSITE] && !validateWebsiteUrl(form.data[ServiceWorkflowParams.WEBSITE])) {
            errors.website = t('workflows.createService.step2.validation.websiteInvalid');
        }
        
        setValidationErrors(errors);
        
        setIsFormValid(
            !!form.data[ServiceWorkflowParams.NAME] &&
            !!form.data[ServiceWorkflowParams.EMAIL] &&
            validateEmail(form.data[ServiceWorkflowParams.EMAIL]) &&
            (!form.data[ServiceWorkflowParams.WEBSITE] || validateWebsiteUrl(form.data[ServiceWorkflowParams.WEBSITE])) &&
            !!form.data[ServiceWorkflowParams.SERVICE_HASH]
        );
    };

    const handleInputChange = (field: string, value: string) => {
        form.setData(field as keyof typeof form.data, value);
    };

    const submitForm = () => {
        form.post(
            generateLocalizedRoute('workflows.createService.saveContactAndLocation'),
            {
                preserveScroll: true,
                onSuccess: () => {
                   
                },
                onError: () => {
                   
                }
            }
        );
    };

    const saveContactInfo = () => {
        contactForm.post(
            generateLocalizedRoute('workflows.createService.saveContactInfo'),
            {
                preserveScroll: true,
                onSuccess: () => {
                  
                },
                onError: () => {
                    
                }
            }
        );
    };

    return (
        <WorkflowLayout  asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background w-full overflow-y-auto max-h-[60vh] p-6 lg:p-8">
                    <div className="w-full mx-auto space-y-6 px-4">
                        {/* Success Message */}
                        {form.recentlySuccessful && (
                            <div className=" p-4" data-testid="service-contact-save-success">
                                <div className="flex">
                                    <div className="ml-3">
                                        <Paragraph className="text-sm font-medium text-success">
                                            {t('workflows.createService.step2.serviceCreatedSuccess')}
                                        </Paragraph>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Service Information Form */}
                        <div className="space-y-6" data-testid="service-contact-information-form">
                            {/* Name Field */}
                            <div data-testid="service-contact-name-field">
                                <Paragraph size="xs" className="block font-medium mb-2">
                                    {t('workflows.createService.step2.name')}
                                    <span className="text-error">*</span>
                                </Paragraph>
                                <TextInput
                                    value={form.data[ServiceWorkflowParams.NAME]}
                                    onChange={(e) => handleInputChange(ServiceWorkflowParams.NAME, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-persist/[20%] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder=""
                                    required
                                    data-testid="service-contact-name-input"
                                />
                            </div>

                            {/* Email and Website URL Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="service-contact-email-website-row">
                                {/* Email Field */}
                                <div data-testid="service-contact-email-field">
                                    <Paragraph size='xs' className="block font-medium  mb-2">
                                        {t('workflows.createService.step2.emailAddress')}
                                        <span className="text-error">*</span>
                                    </Paragraph>
                                    <TextInput
                                        type="email"
                                        value={form.data[ServiceWorkflowParams.EMAIL]}
                                        onChange={(e) => handleInputChange(ServiceWorkflowParams.EMAIL, e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                            validationErrors.email ? 'border-error' : 'border-gray-persist/[20%]'
                                        }`}
                                        placeholder=""
                                        required
                                        data-testid="service-contact-email-input"
                                    />
                                    {validationErrors.email && (
                                        <Paragraph className="mt-1 text-sm text-error" data-testid="service-contact-email-error">{validationErrors.email}</Paragraph>
                                    )}
                                </div>

                                {/* Website URL Field */}
                                <div data-testid="service-contact-website-field">
                                    <Paragraph size='xs' className="block font-medium mb-2">
                                        {t('workflows.createService.step2.websiteUrl')}
                                    </Paragraph>
                                    <TextInput
                                        type="url"
                                        value={form.data[ServiceWorkflowParams.WEBSITE]}
                                        onChange={(e) => handleInputChange(ServiceWorkflowParams.WEBSITE, e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                            validationErrors.website ? 'border-error' : 'border-gray-persist/[20%]'
                                        }`}
                                        placeholder=""
                                        data-testid="service-contact-website-input"
                                    />
                                    {validationErrors.website && (
                                        <Paragraph className="mt-1 text-sm text-error" data-testid="service-contact-website-error">{validationErrors.website}</Paragraph>
                                    )}
                                </div>
                            </div>

                            {/* GitHub and LinkedIn Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="service-contact-social-row">
                                {/* GitHub Field */}
                                <div data-testid="service-contact-github-field">
                                    <Paragraph size='xs' className="block font-medium mb-2">
                                        {t('workflows.createService.step2.github')}
                                    </Paragraph>
                                    <TextInput
                                        value={form.data[ServiceWorkflowParams.GITHUB]}
                                        onChange={(e) => handleInputChange(ServiceWorkflowParams.GITHUB, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-persist/[20%] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        data-testid="service-contact-github-input"
                                    />
                                </div>

                                {/* LinkedIn Field */}
                                <div data-testid="service-contact-linkedin-field">
                                    <Paragraph size='xs' className="block font-medium  mb-2">
                                        {t('workflows.createService.step2.linkedin')}
                                    </Paragraph>
                                    <TextInput
                                        value={form.data[ServiceWorkflowParams.LINKEDIN]}
                                        onChange={(e) => handleInputChange(ServiceWorkflowParams.LINKEDIN, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-persist/[20%] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder=""
                                        data-testid="service-contact-linkedin-input"
                                    />
                                </div>
                            </div>

                            {/* Add Network Button */}
                            <div className="flex justify-end" data-testid="service-contact-save-section">
                                <div className="flex flex-col items-end">
                                    <PrimaryButton
                                        type="button"
                                        onClick={saveContactInfo}
                                        disabled={contactForm.processing}
                                        className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-primary/60 text-white text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                                        data-testid="service-contact-save-button"
                                    >
                                        {contactForm.processing ? t('workflows.createService.step2.saving') : t('workflows.createService.step2.addNetwork')}
                                    </PrimaryButton>
                                    
                                    {/* Display form errors if any */}
                                    {Object.keys(contactForm.errors).length > 0 && (
                                        <div className="mt-2 text-sm text-error" data-testid="service-contact-save-error">
                                            {Object.values(contactForm.errors)[0]}
                                        </div>
                                    )}
                                    
                                    {/* Success message - you can add this via flash messages */}
                                    {contactForm.recentlySuccessful && (
                                        <div className="mt-2" data-testid="service-contact-save-success-message">
                                            <Paragraph size="sm" className="text-success">
                                                {t('workflows.createService.step2.contactInfoSavedSuccess')}
                                            </Paragraph>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Field */}
                            <div data-testid="service-location-field">
                                <Paragraph size="xs" className="block font-medium mb-2">
                                    {t('workflows.createService.step2.location')}
                                </Paragraph>
                                <TextInput
                                    value={form.data[ServiceWorkflowParams.LOCATION]}
                                    onChange={(e) => handleInputChange(ServiceWorkflowParams.LOCATION, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-persist/[20%] rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                    placeholder={t('workflows.createService.step2.enterCity')}
                                    data-testid="service-location-input"
                                />
                            </div>
                        </div>
                    </div>
                    
                   
                </div>
            </Content>
             <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="inline-flex items-center px-4 py-3 mb-8 bg-primary hover:bg-primary/[0.8] text-white text-sm font-medium rounded-md transition-colors"
                    data-testid="service-step2-previous-button"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryButton
                    className="inline-flex items-center px-4 py-3 mb-8 bg-primary hover:bg-primary/[0.8] text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isFormValid || form.processing}
                    onClick={submitForm}
                    data-testid="service-step2-submit-button"
                >
                    <span>{t('workflows.createService.step2.submitService')}</span>
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
