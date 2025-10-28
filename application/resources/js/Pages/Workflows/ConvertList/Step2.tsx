import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import { ConversionType } from '@/enums/conversion-type';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { CheckCircle } from 'lucide-react';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import WorkflowLayout from '../WorkflowLayout';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';

interface Step2Props {
    stepDetails: StepDetails[];
    activeStep: number;
    collection: BookmarkCollectionData;
    conversionType: ConversionType;
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    collection,
    conversionType,
}) => {
    const { t } = useLaravelReactI18n();

    const getSuccessMessage = () => {
        if (conversionType === ConversionType.TO_VOTER) {
            return t('workflows.convertList.successVoterMessage');
        }
        return t('workflows.convertList.successResearchMessage');
    };

    return (
        <WorkflowLayout
            title={t('Success')}
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
            wrapperClassName="!h-auto"
            contentClassName="!max-h-none"
        >
            <Content>
                <div className="bg-background flex h-full w-full flex-col items-center justify-center py-12">
                    <div className="items-center flex flex-col gap-2">
                        <Title level="2" className="font-bold">
                            {t('workflows.bookmarks.success.title')}!
                        </Title>
                        <VerificationBadge size={80} />

                        {/* Success Message */}
                        <div className="bg-muted rounded-lg p-6 space-y-4  w-96">
                            <Paragraph className="text-center text-gray-persist">
                                {getSuccessMessage()}
                            </Paragraph>
                        </div>
                        <div className="flex justify-center w-full">
                            <Link href={useLocalizedRoute('lists.view', {
                                bookmarkCollection: collection?.id,
                                type: 'proposals'
                            })}>
                                <PrimaryButton
                                    className="text-sm lg:px-8 lg:py-3"
                                    data-testid="view-converted-list-button"
                                >
                                    {t('workflows.convertList.viewList')}
                                </PrimaryButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </Content>
        </WorkflowLayout>
    );
};

export default Step2;
