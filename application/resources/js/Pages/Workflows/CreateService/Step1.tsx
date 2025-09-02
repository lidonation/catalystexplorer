import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import Textarea from '@/Components/atoms/Textarea';
import { StepDetails } from '@/types';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import { useLaravelReactI18n } from "laravel-react-i18n";
import CategoriesSelector from './Partials/CategoriesSelector';
import ImageFrameIcon from '@/Components/svgs/ImageFrameIcon';
import { useForm, usePage } from '@inertiajs/react';
import { ServiceWorkflowParams } from '@/enums/service-workflow-params';

interface Step1Props {
    stepDetails: StepDetails[];
    activeStep: number;
    categories: Array<{
        id: number;
        name: string;
        slug: string;
        children?: Array<{
            id: number;
            name: string;
            slug: string;
            parent_id: number;
        }>;
    }>;
    serviceHash?: string;
    serviceData?: {
        title?: string;
        description?: string;
        type?: string;
        categories?: number[];
        [ServiceWorkflowParams.HEADER_IMAGE_URL]?: string;
    };
}

interface PageProps {
    flash: {
        error?: Record<string, string[]>;
        success?: string;
    };
    [key: string]: any;
}

const Step1: React.FC<Step1Props> = ({ 
    stepDetails, 
    activeStep, 
    categories, 
    serviceHash,
    serviceData 
}) => {
    const form = useForm({
        [ServiceWorkflowParams.SERVICE_HASH]: serviceHash || '',
        [ServiceWorkflowParams.TYPE]: serviceData?.type || 'offered',
        [ServiceWorkflowParams.TITLE]: serviceData?.title || '',
        [ServiceWorkflowParams.DESCRIPTION]: serviceData?.description || '',
        [ServiceWorkflowParams.CATEGORIES]: serviceData?.categories?.map(String) || [] as string[],
        [ServiceWorkflowParams.HEADER_IMAGE]: null as File | null
    });

    const page = usePage<PageProps>();
    const flashErrors = page.props.flash?.error || {};

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        serviceData?.categories?.map(String) || []
    );
    const [headerImage, setHeaderImage] = useState<File | null>(null);
    const [headerImagePreview, setHeaderImagePreview] = useState<string | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    const { t } = useLaravelReactI18n();

    const prevStep = activeStep === 1
        ? ''
        : generateLocalizedRoute('workflows.createService.index', {
            step: activeStep - 1,
        });

    useEffect(() => {
        validateForm();
    }, [form.data, selectedCategories]);

    const validateForm = () => {
        setIsFormValid(
            !!form.data[ServiceWorkflowParams.TITLE].trim() &&
            !!form.data[ServiceWorkflowParams.DESCRIPTION].trim() &&
            selectedCategories.length > 0
        );
    };

    const handleTypeChange = (type: string) => {
        form.setData(ServiceWorkflowParams.TYPE, type);
    };

    const handleInputChange = (field: string, value: string) => {
        form.setData(field as keyof typeof form.data, value);
    };

    const handleCategoriesChange = (selectedCats: string[]) => {
        setSelectedCategories(selectedCats);
        form.setData(ServiceWorkflowParams.CATEGORIES, selectedCats);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setHeaderImage(file);
            form.setData(ServiceWorkflowParams.HEADER_IMAGE, file);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                setHeaderImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const submitForm = () => {
        form.post(
            generateLocalizedRoute('workflows.createService.saveServiceDetails'),
            {
            onSuccess: (page) => {
                //
            },
           onError: (errors) => {
               //
            },    
            }
        );
    };

    return (
        <WorkflowLayout
            title="Create Service"
            wrapperClassName="!h-auto"
            contentClassName="!max-h-none"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background w-full overflow-x-visible overflow-y-auto p-6 lg:p-8">
                    <div className="mx-auto max-w-3xl space-y-6">
                        {/* Service Type Selection */}
                        <div data-testid="service-type-selection">
                            <Paragraph size="xs" className="mb-4 font-medium">
                                {t(
                                    'workflows.createService.step1.howToContribute',
                                )}
                                {flashErrors[ServiceWorkflowParams.TYPE] && (
                                    <Paragraph
                                        className="text-error ml-2"
                                        data-testid="service-type-flash-error"
                                    >
                                        {
                                            flashErrors[
                                                ServiceWorkflowParams.TYPE
                                            ][0]
                                        }
                                    </Paragraph>
                                )}
                                {form.errors[ServiceWorkflowParams.TYPE] && (
                                    <Paragraph
                                        className="text-error ml-2"
                                        data-testid="service-type-form-error"
                                    >
                                        {
                                            form.errors[
                                                ServiceWorkflowParams.TYPE
                                            ]
                                        }
                                    </Paragraph>
                                )}
                            </Paragraph>
                            <div className="space-y-3">
                                <div
                                    className="flex cursor-pointer items-center"
                                    data-testid="service-type-offered"
                                >
                                    <input
                                        type="radio"
                                        name="serviceType"
                                        value="offered"
                                        checked={
                                            form.data[
                                                ServiceWorkflowParams.TYPE
                                            ] === 'offered'
                                        }
                                        onChange={() =>
                                            handleTypeChange('offered')
                                        }
                                        className="text-primary focus:ring-primary mr-3 h-4 w-4"
                                        data-testid="service-type-offered-radio"
                                    />
                                    <Paragraph
                                        size="xs"
                                        className="text-gray-persist"
                                    >
                                        {t(
                                            'workflows.createService.step1.offerService',
                                        )}
                                    </Paragraph>
                                    <Paragraph
                                        size="sm"
                                        className="bg-success ml-2 items-center justify-center rounded-full px-2 py-1 text-xs whitespace-nowrap text-white sm:text-sm"
                                    >
                                        {t(
                                            'workflows.createService.step1.offeringServiceBadge',
                                        )}
                                    </Paragraph>
                                </div>
                                <label
                                    className="flex cursor-pointer items-center"
                                    data-testid="service-type-needed"
                                >
                                    <input
                                        type="radio"
                                        name="serviceType"
                                        value="needed"
                                        checked={
                                            form.data[
                                                ServiceWorkflowParams.TYPE
                                            ] === 'needed'
                                        }
                                        onChange={() =>
                                            handleTypeChange('needed')
                                        }
                                        className="text-primary focus:ring-primary mr-3 h-4 w-4"
                                        data-testid="service-type-needed-radio"
                                    />
                                    <Paragraph
                                        size="xs"
                                        className="text-gray-persist"
                                    >
                                        {t(
                                            'workflows.createService.step1.needService',
                                        )}
                                    </Paragraph>
                                    <Paragraph
                                        size="sm"
                                        className="bg-warning ml-2 items-center justify-center rounded-full px-2 py-1 text-xs whitespace-nowrap text-white sm:text-sm"
                                    >
                                        {t(
                                            'workflows.createService.step1.requestingServiceBadge',
                                        )}
                                    </Paragraph>
                                </label>
                            </div>
                        </div>

                        {/* Service Title */}
                        <div data-testid="service-title-field">
                            <Paragraph
                                size="xs"
                                className="mb-2 block font-medium"
                            >
                                {t(
                                    'workflows.createService.step1.serviceTitle',
                                )}
                                {flashErrors[ServiceWorkflowParams.TITLE] && (
                                    <Paragraph
                                        className="text-error ml-2"
                                        data-testid="service-title-flash-error"
                                    >
                                        {
                                            flashErrors[
                                                ServiceWorkflowParams.TITLE
                                            ][0]
                                        }
                                    </Paragraph>
                                )}
                                {form.errors[ServiceWorkflowParams.TITLE] && (
                                    <Paragraph
                                        className="text-error ml-2"
                                        data-testid="service-title-form-error"
                                    >
                                        {
                                            form.errors[
                                                ServiceWorkflowParams.TITLE
                                            ]
                                        }
                                    </Paragraph>
                                )}
                            </Paragraph>
                            <TextInput
                                id="title"
                                type="text"
                                value={form.data[ServiceWorkflowParams.TITLE]}
                                onChange={(e) =>
                                    handleInputChange(
                                        ServiceWorkflowParams.TITLE,
                                        e.target.value,
                                    )
                                }
                                className="border-gray-persist/[50%] w-full rounded-lg border"
                                data-testid="service-title-input"
                            />
                        </div>

                        {/* Image Header */}
                        <div data-testid="service-header-image-field">
                            <Paragraph
                                size="xs"
                                className="mb-2 block font-medium"
                            >
                                {t('workflows.createService.step1.imageHeader')}
                                {flashErrors[
                                    ServiceWorkflowParams.HEADER_IMAGE
                                ] && (
                                    <Paragraph
                                        className="text-error ml-2"
                                        data-testid="service-header-image-flash-error"
                                    >
                                        {
                                            flashErrors[
                                                ServiceWorkflowParams
                                                    .HEADER_IMAGE
                                            ][0]
                                        }
                                    </Paragraph>
                                )}
                                {form.errors[
                                    ServiceWorkflowParams.HEADER_IMAGE
                                ] && (
                                    <Paragraph
                                        className="text-error ml-2"
                                        data-testid="service-header-image-form-error"
                                    >
                                        {
                                            form.errors[
                                                ServiceWorkflowParams
                                                    .HEADER_IMAGE
                                            ]
                                        }
                                    </Paragraph>
                                )}
                            </Paragraph>
                            <div
                                className="border-gray-persist/[50%] hover:border-gray-persist relative h-48 overflow-hidden rounded-lg border transition-colors"
                                data-testid="service-header-image-upload-area"
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="imageUpload"
                                    data-testid="service-header-image-input"
                                />
                                <label
                                    htmlFor="imageUpload"
                                    className="block h-full w-full cursor-pointer"
                                >
                                    {headerImage && headerImagePreview ? (
                                        <div
                                            data-testid="service-header-image-selected"
                                            className="group relative h-full w-full"
                                        >
                                            <img
                                                src={headerImagePreview}
                                                alt="Selected header"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="bg-dark bg-opacity-50 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-70">
                                                <Paragraph className="text-sm font-medium text-white">
                                                    {t(
                                                        'workflows.createService.step1.clickToReplaceImage',
                                                    )}
                                                </Paragraph>
                                            </div>
                                        </div>
                                    ) : serviceData?.[
                                          ServiceWorkflowParams.HEADER_IMAGE_URL
                                      ] ? (
                                        <div
                                            data-testid="service-header-image-existing"
                                            className="group relative h-full w-full"
                                        >
                                            <img
                                                src={
                                                    serviceData[
                                                        ServiceWorkflowParams
                                                            .HEADER_IMAGE_URL
                                                    ]
                                                }
                                                alt="Service header"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="bg-dark bg-opacity-50 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-70">
                                                <Paragraph className="text-sm font-medium text-white">
                                                    {t(
                                                        'workflows.createService.step1.clickToReplaceImage',
                                                    )}
                                                </Paragraph>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex h-full w-full flex-col items-center justify-center p-8 text-center"
                                            data-testid="service-header-image-placeholder"
                                        >
                                            <ImageFrameIcon className="text-gray-persist/[20%] mb-2" />
                                            <Paragraph className="text-gray-persist text-sm">
                                                {t(
                                                    'workflows.createService.step1.clickToUploadImage',
                                                )}
                                            </Paragraph>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div data-testid="service-description-field">
                            <Paragraph size="xs" className="mb-2 block">
                                {t('workflows.createService.step1.description')}
                                {flashErrors[
                                    ServiceWorkflowParams.DESCRIPTION
                                ] && (
                                    <Paragraph
                                        className="text-error ml-2"
                                        data-testid="service-description-flash-error"
                                    >
                                        {
                                            flashErrors[
                                                ServiceWorkflowParams
                                                    .DESCRIPTION
                                            ][0]
                                        }
                                    </Paragraph>
                                )}
                                {form.errors[
                                    ServiceWorkflowParams.DESCRIPTION
                                ] && (
                                    <Paragraph
                                        className="text-error ml-2"
                                        data-testid="service-description-form-error"
                                    >
                                        {
                                            form.errors[
                                                ServiceWorkflowParams
                                                    .DESCRIPTION
                                            ]
                                        }
                                    </Paragraph>
                                )}
                            </Paragraph>
                            <Textarea
                                id="description"
                                value={
                                    form.data[ServiceWorkflowParams.DESCRIPTION]
                                }
                                onChange={(e) =>
                                    handleInputChange(
                                        ServiceWorkflowParams.DESCRIPTION,
                                        e.target.value,
                                    )
                                }
                                className="border-gray-persist/[50%] h-32 w-full rounded-lg border"
                                data-testid="service-description-textarea"
                            />
                        </div>

                        {/* Category Selection */}
                        <div>
                            <CategoriesSelector
                                categories={categories}
                                selectedCategories={selectedCategories}
                                onChange={handleCategoriesChange}
                                placeholder={t(
                                    'workflows.createService.step1.selectCategories',
                                )}
                                label={t(
                                    'workflows.createService.step1.category',
                                )}
                            />
                            {flashErrors[ServiceWorkflowParams.CATEGORIES] && (
                                <div className="mt-1">
                                    <Paragraph
                                        className="text-error text-sm"
                                        data-testid="service-categories-flash-error"
                                    >
                                        {
                                            flashErrors[
                                                ServiceWorkflowParams.CATEGORIES
                                            ][0]
                                        }
                                    </Paragraph>
                                </div>
                            )}
                            {form.errors[ServiceWorkflowParams.CATEGORIES] && (
                                <div className="mt-1">
                                    <Paragraph
                                        className="text-error text-sm"
                                        data-testid="service-categories-form-error"
                                    >
                                        {
                                            form.errors[
                                                ServiceWorkflowParams.CATEGORIES
                                            ]
                                        }
                                    </Paragraph>
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        className="mt-8 flex justify-between"
                        data-testid="service-step1-navigation"
                    >
                        <PrimaryLink
                            href={prevStep}
                            className="text-sm lg:px-8 lg:py-3"
                            disabled={activeStep == 1}
                            onClick={(e) =>
                                activeStep == 1 && e.preventDefault()
                            }
                            data-testid="service-step1-previous-button"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span>{t('Previous')}</span>
                        </PrimaryLink>
                        <PrimaryButton
                            className="text-sm lg:px-8 lg:py-3"
                            disabled={!isFormValid || form.processing}
                            onClick={submitForm}
                            data-testid="service-step1-next-button"
                        >
                            <span>{t('Next')}</span>
                            <ChevronRight className="h-4 w-4" />
                        </PrimaryButton>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default Step1;