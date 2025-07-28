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
import { useForm } from '@inertiajs/react';
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
    };
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

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        serviceData?.categories?.map(String) || []
    );
    const [headerImage, setHeaderImage] = useState<File | null>(null);
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
            // Header image is optional, so not included in validation
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
        }
    };

    const submitForm = () => {
        form.post(
            generateLocalizedRoute('workflows.createService.saveServiceDetails')
        );
    };

    return (
        <WorkflowLayout  wrapperClassName="!h-auto"
            contentClassName="!max-h-none" asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background w-full overflow-y-auto p-6 lg:p-8 overflow-x-visible ">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Service Type Selection */}
                        <div data-testid="service-type-selection">
                            <Paragraph size='xs' className="font-medium mb-4">
                                {t('workflows.createService.step1.howToContribute')}
                            </Paragraph>
                            <div className="space-y-3">
                                <div className="flex items-center cursor-pointer" data-testid="service-type-offered">
                                    <input
                                        type="radio"
                                        name="serviceType"
                                        value="offered"
                                        checked={form.data[ServiceWorkflowParams.TYPE] === 'offered'}
                                        onChange={() => handleTypeChange('offered')}
                                        className="mr-3 h-4 w-4 text-primary focus:ring-primary"
                                        data-testid="service-type-offered-radio"
                                    />
                                    <Paragraph size='xs' className="text-gray-persist">
                                        {t('workflows.createService.step1.offerService')}
                                    </Paragraph>
                                    <Paragraph size='sm' className="ml-2 px-2 py-1 justify-center items-center bg-success text-white rounded-full whitespace-nowrap text-xs sm:text-sm">
                                        {t('workflows.createService.step1.offeringServiceBadge')}
                                    </Paragraph>
                                </div>
                                <label className="flex items-center cursor-pointer" data-testid="service-type-needed">
                                    <input
                                        type="radio"
                                        name="serviceType"
                                        value="needed"
                                        checked={form.data[ServiceWorkflowParams.TYPE] === 'needed'}
                                        onChange={() => handleTypeChange('needed')}
                                        className="mr-3 h-4 w-4 text-primary focus:ring-primary"
                                        data-testid="service-type-needed-radio"
                                    />
                                    <Paragraph size='xs' className="text-gray-persist">
                                        {t('workflows.createService.step1.needService')}
                                    </Paragraph>
                                    <Paragraph size='sm' className="ml-2 px-2 py-1 bg-warning justify-center items-center text-white rounded-full whitespace-nowrap text-xs sm:text-sm">
                                        {t('workflows.createService.step1.requestingServiceBadge')}
                                    </Paragraph>
                                </label>
                            </div>
                        </div>

                        {/* Service Title */}
                        <div data-testid="service-title-field">
                            <Paragraph size='xs' className="block font-medium mb-2">
                                {t('workflows.createService.step1.serviceTitle')}
                            </Paragraph>
                            <TextInput
                                id="title"
                                type="text"
                                value={form.data[ServiceWorkflowParams.TITLE]}
                                onChange={(e) => handleInputChange(ServiceWorkflowParams.TITLE, e.target.value)}
                                className="w-full border border-gray-persist/[20%] rounded-lg"
                                data-testid="service-title-input"
                            />
                        </div>

                        {/* Image Header */}
                        <div data-testid="service-header-image-field">
                            <Paragraph size='xs' className="block font-medium  mb-2">
                                {t('workflows.createService.step1.imageHeader')}
                            </Paragraph>
                            <div className="border-2  border-gray-persist/[20%] rounded-lg p-8 text-center hover:border-gray-persist transition-colors" data-testid="service-header-image-upload-area">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="imageUpload"
                                    data-testid="service-header-image-input"
                                />
                                <label htmlFor="imageUpload" className="cursor-pointer">
                                    {headerImage ? (
                                        <div data-testid="service-header-image-selected">
                                            <Paragraph className="text-sm">
                                                {t('workflows.createService.step1.selectedImageText', { fileName: headerImage.name })}
                                            </Paragraph>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center" data-testid="service-header-image-placeholder">
                                            <ImageFrameIcon className='text-gray-persist/[20%]' />
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div data-testid="service-description-field">
                            <Paragraph size='xs' className="block mb-2">
                                {t('workflows.createService.step1.description')}
                            </Paragraph>
                            <Textarea
                                id="description"
                                value={form.data[ServiceWorkflowParams.DESCRIPTION]}
                                onChange={(e) => handleInputChange(ServiceWorkflowParams.DESCRIPTION, e.target.value)}
                                className="w-full h-32 border border-gray-persist/[20%] rounded-lg"
                                data-testid="service-description-textarea"
                            />
                        </div>

                        {/* Category Selection */}
                        <CategoriesSelector
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onChange={handleCategoriesChange}
                            placeholder={t('workflows.createService.step1.selectCategories')}
                            label={t('workflows.createService.step1.category')}
                        />
                    </div>
                    <div className='mt-8 flex justify-between' data-testid="service-step1-navigation">
                        <PrimaryLink
                            href={prevStep}
                            className="text-sm lg:px-8 lg:py-3"
                            disabled={activeStep == 1}
                            onClick={(e) => activeStep == 1 && e.preventDefault()}
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