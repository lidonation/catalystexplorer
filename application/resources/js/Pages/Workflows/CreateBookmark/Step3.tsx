import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { BookmarkProvider } from '@/Context/BookmarkContext';
import BookmarkModelSearch from '@/Pages/Bookmarks/Partials/BookmarkModelSearch';
import { StepDetails } from '@/types';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import { Link } from '@inertiajs/react';

interface Campaign {
    id: number;
    title: string;
    hash: string;
}

interface Step3Props {
    stepDetails: StepDetails[];
    activeStep: number;
    collectionItems?: Record<string, string[]>;
    bookmarkCollection: BookmarkCollectionData;
}

const Step3: React.FC<Step3Props> = ({
    stepDetails,
    activeStep,
    collectionItems,
    bookmarkCollection,
}) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.bookmarks.index', {
        step: activeStep - 1,
        bookmarkCollection: bookmarkCollection.id,
    });

    const nextStep = localizedRoute('workflows.bookmarks.index', {
        step: activeStep + 1,
        bookmarkCollection: bookmarkCollection.id,
    });

    return (
        <WorkflowLayout
            title="Create Bookmark"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="container h-[800px]">
                    <BookmarkProvider
                        bookmarkCollection={bookmarkCollection}
                        preselected={collectionItems}
                    >
                        <BookmarkModelSearch />
                    </BookmarkProvider>
                </div>
            </Content>

            <Footer>
                {bookmarkCollection && (
                    <Link
                        href={localizedRoute('my.lists.index')}
                        className="text-sm lg:px-8 lg:py-3"
                    >
                        {t('Close')}
                    </Link>
                )}
                <div className="flex gap-2">
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
                </div>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step3;
