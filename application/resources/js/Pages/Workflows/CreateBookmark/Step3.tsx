import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { BookmarkProvider } from '@/Context/BookmarkContext';
import BookmarkModelSearch from '@/Pages/My/Bookmarks/Partials/BookmarkModelSearch';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Campaign {
    id: number;
    title: string;
    hash: string;
}

interface Step3Props {
    stepDetails: StepDetails[];
    activeStep: number;
    collectionItems?: Record<string, string[]>;
    bookmarkCollection: string;
}

const Step3: React.FC<Step3Props> = ({
    stepDetails,
    activeStep,
    collectionItems,
    bookmarkCollection,
}) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.bookmarks.index', {
        step: activeStep - 1,
        bookmarkCollection,
    });

    const nextStep = localizedRoute('workflows.bookmarks.index', {
        step: activeStep + 1,
        bookmarkCollection,
    });

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1].info ?? ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="container">
                    <BookmarkProvider
                        bookmarkCollection={bookmarkCollection}
                        preselected={collectionItems}
                    >
                        <BookmarkModelSearch />
                    </BookmarkProvider>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
                <PrimaryLink
                    href={nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={collectionItems && !!collectionItems?.length}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step3;
