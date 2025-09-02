import React, { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft } from 'lucide-react';
import WorkflowLayout from '../WorkflowLayout';
import Nav from '../Partials/WorkflowNav';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Paragraph from '@/Components/atoms/Paragraph';
import BookmarkCollectionManager from '@/Components/BookmarkCollectionManager';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { StepDetails } from '@/types';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import CommunityData = App.DataTransferObjects.CommunityData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupData = App.DataTransferObjects.GroupData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import Title from '@/Components/atoms/Title';
import ArchiveIcon from '@/Components/svgs/ArchiveIcon';

interface Step2Props {
    stepDetails: StepDetails[];
    activeStep: number;
    bookmarkHash?: string;
    bookmarkCollection?: App.DataTransferObjects.BookmarkCollectionData;
    type?: 'proposals' | 'communities' | 'groups' | 'ideascaleProfiles' | 'reviews';
    proposals?: PaginatedData<App.DataTransferObjects.ProposalData[]>;
    communities?: PaginatedData<App.DataTransferObjects.CommunityData[]>;
    groups?: PaginatedData<App.DataTransferObjects.GroupData[]>;
    ideascaleProfiles?: PaginatedData<App.DataTransferObjects.IdeascaleProfileData[]>;
    reviews?: PaginatedData<App.DataTransferObjects.ReviewData[]>;
    filters?: SearchParams;
}

interface PageProps {
    flash?: {
        success?: string | {
            message?: string;
            ipfs_cid?: string;
            gateway_url?: string;
            filename?: string;
        };
    };
    errorBags?: {
        default?: {
            error?: string[];
        };
    };
    [key: string]: any;
}

const Step2: React.FC<Step2Props> = ({ 
    stepDetails, 
    activeStep,
    bookmarkHash,
    bookmarkCollection,
    type = 'proposals',
    proposals,
    communities,
    groups,
    ideascaleProfiles,
    reviews,
    filters = {} as SearchParams,
}) => {
    const form = useForm({
        publishSettings: 'public' as 'public' | 'private',
        includeMetadata: true as boolean,
        bookmarkHash: bookmarkHash || '',
    });

    const page = usePage<PageProps>();
    const flashErrors = page.props.errorBags?.default || {};
    const flashSuccess = page.props.flash?.success || null;

    const [isFormValid, setIsFormValid] = useState(true);
    const [activeTab, setActiveTab] = useState(type);

    const { t } = useLaravelReactI18n();

    const prevStep = generateLocalizedRoute('workflows.publishToIpfs.index', {
        step: activeStep - 1,
        ...(bookmarkHash && { bookmarkHash }),
    });

    useEffect(() => {
        validateForm();
    }, [form.data]);

    const validateForm = () => {
        const hasPublishSettings = !!form.data.publishSettings;
        const hasProposals = bookmarkCollection?.types_count?.proposals > 0;
        
        setIsFormValid(hasPublishSettings && hasProposals);
    };
    
    const submitForm = () => {
        form.post(
            generateLocalizedRoute('workflows.publishToIpfs.publishListToIpfs'),
            {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    
                    console.log('Successfully published to IPFS:', page.props.flash?.success);
                },
                onError: (errors) => {
                    console.error('Failed to publish to IPFS:', errors);
                }
            }
        );
    };

    const handleTabChange = (tab: 'proposals' | 'communities' | 'groups' | 'ideascaleProfiles' | 'reviews') => {
       
        const step2Route = generateLocalizedRoute('workflows.publishToIpfs.index', {
            step: 2,
            type: tab,
            ...(bookmarkHash && { bookmarkHash }),
        });
        
        router.visit(step2Route, {
            preserveState: false,
            replace: true,
        });
    };

    const getCurrentTypeData = () => {
        return {
            type: activeTab,
            bookmarkCollection: bookmarkCollection!,
            filters,
            proposals,
            communities,
            groups,
            ideascaleProfiles,
            reviews,
        };
    };

    return (
        <WorkflowLayout
            title="Publish To IPFS"
            asideInfo={stepDetails[activeStep - 1].info ?? ''}
            wrapperClassName="!h-auto"
            contentClassName="!max-h-none"
            data-testid="step2-workflow-layout"
        >
            <Nav
                stepDetails={stepDetails}
                activeStep={activeStep}
                data-testid="step2-navigation"
            />

            <div
                className="bg-background w-full overflow-y-auto p-6 lg:p-8"
                data-testid="step2-main-content"
            >
                {Object.keys(flashErrors).length > 0 && (
                    <div
                        className="bg-error-light border-error mb-6 rounded-md border p-4"
                        data-testid="step2-error-banner"
                    >
                        <div
                            className="text-error"
                            data-testid="step2-error-content"
                        >
                            <Paragraph
                                className="text-md font-bold"
                                data-testid="step2-error-title"
                            >
                                {t('workflows.publishToIpfs.error')}
                            </Paragraph>
                            {Object.entries(flashErrors).map(
                                ([key, messages]) => (
                                    <div
                                        key={key}
                                        data-testid={`step2-error-${key}`}
                                    >
                                        {Array.isArray(messages)
                                            ? messages.join(', ')
                                            : messages}
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}

                {bookmarkCollection ? (
                    <>
                        <Paragraph
                            className="text-gray-persist mb-6 text-center"
                            data-testid="step2-review-message"
                        >
                            {t('workflows.publishToIpfs.reviewDetails')}
                        </Paragraph>
                        <div
                            className="border-gray-persist/20 rounded-lg border p-6 shadow-md"
                            data-testid="step2-bookmark-collection-section"
                        >
                            <div
                                className="mb-6"
                                data-testid="step2-collection-header"
                            >
                                <Title
                                    className="mb-2"
                                    data-testid="step2-collection-title"
                                >
                                    {bookmarkCollection.title}
                                </Title>
                                <Paragraph
                                    className="text-gray-persist max-w-full overflow-hidden break-words"
                                    style={{
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-line',
                                    }}
                                    data-testid="step2-collection-description"
                                >
                                    {bookmarkCollection.content ||
                                        t(
                                            'workflows.publishToIpfs.noDescriptionAvailable',
                                        )}
                                </Paragraph>
                                <div
                                    className="mt-3 flex items-center gap-4 text-sm"
                                    data-testid="step2-collection-metadata"
                                >
                                    <Paragraph
                                        className="text-md font-bold"
                                        data-testid="step2-items-count"
                                    >
                                        {t('workflows.publishToIpfs.items')}{' '}
                                        <span className="text-gray-persist font-medium">
                                            {bookmarkCollection.types_count
                                                ?.proposals || 0}
                                        </span>
                                    </Paragraph>
                                    <Paragraph
                                        className="text-light-gray-persist"
                                        data-testid="step2-separator"
                                    >
                                        {t('workflows.publishToIpfs.separator')}
                                    </Paragraph>
                                    <Paragraph
                                        className="text-md font-bold"
                                        data-testid="step2-created-date"
                                    >
                                        {t('workflows.publishToIpfs.created')}{' '}
                                        <span className="text-gray-persist font-medium">
                                            {bookmarkCollection.created_at
                                                ? new Date(
                                                      bookmarkCollection.created_at,
                                                  ).toLocaleDateString(
                                                      'en-GB',
                                                      {
                                                          day: 'numeric',
                                                          month: 'long',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : t(
                                                      'workflows.publishToIpfs.unknown',
                                                  )}
                                        </span>
                                    </Paragraph>
                                </div>
                            </div>

                            <BookmarkCollectionManager
                                {...getCurrentTypeData()}
                                bookmarkCollection={bookmarkCollection}
                                showHead={false}
                                showHeader={false}
                                showComments={false}
                                showEditButton={false}
                                showDropdownMenu={false}
                                showSearchBar={false}
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                                proposalDisplayMode="table"
                                data-testid="step2-bookmark-collection-manager"
                            />
                        </div>
                    </>
                ) : (
                    <div
                        className="bg-background px-6 py-12 text-center"
                        data-testid="step2-no-list-selected"
                    >
                        <div
                            className="mx-auto max-w-md"
                            data-testid="step2-no-list-content"
                        >
                            <div
                                className="mb-6"
                                data-testid="step2-no-list-icon-section"
                            >
                                <ArchiveIcon
                                    className="text-light-gray-persist mx-auto mb-4 h-16 w-16"
                                    width={64}
                                    height={64}
                                    data-testid="step2-archive-icon"
                                />
                                <Title
                                    level="3"
                                    className="text-content mb-2"
                                    data-testid="step2-no-list-title"
                                >
                                    {t(
                                        'workflows.publishToIpfs.noListSelected.title',
                                    )}
                                </Title>
                                <Paragraph
                                    className="text-content mb-4"
                                    data-testid="step2-no-list-message"
                                >
                                    {t(
                                        'workflows.publishToIpfs.noListSelected.message',
                                    )}
                                </Paragraph>
                            </div>

                            <div
                                className="mb-6 rounded-lg p-4"
                                data-testid="step2-instructions-section"
                            >
                                <div
                                    className="flex items-start"
                                    data-testid="step2-instructions-content"
                                >
                                    <div className="text-sm">
                                        <Paragraph
                                            className="font-bold"
                                            data-testid="step2-instructions-title"
                                        >
                                            {t(
                                                'workflows.publishToIpfs.howToGetStarted',
                                            )}
                                        </Paragraph>
                                        <Paragraph
                                            className="text-gray-persist mt-1"
                                            data-testid="step2-instructions-text"
                                        >
                                            {t(
                                                'workflows.publishToIpfs.noListSelected.instructions',
                                            )}
                                        </Paragraph>
                                    </div>
                                </div>
                            </div>

                            <PrimaryLink
                                href={generateLocalizedRoute('my.lists.index')}
                                className="bg-primary hover:bg-primary/[0.8] inline-flex items-center rounded-md px-6 py-3 font-medium text-white transition-colors"
                                data-testid="step2-go-to-lists-button"
                            >
                                {t(
                                    'workflows.publishToIpfs.noListSelected.goToLists',
                                )}
                            </PrimaryLink>
                        </div>
                    </div>
                )}
            </div>

            <Footer data-testid="step2-footer">
                <PrimaryLink
                    href={prevStep}
                    className="bg-primary hover:bg-primary/[0.8] mb-8 inline-flex items-center rounded-md px-4 py-3 text-sm font-medium text-white transition-colors"
                    data-testid="ipfs-step2-previous-button"
                >
                    <ChevronLeft
                        className="mr-2 h-4 w-4"
                        data-testid="step2-previous-icon"
                    />
                    <span data-testid="step2-previous-text">
                        {t('workflows.publishToIpfs.previous')}
                    </span>
                </PrimaryLink>
                {bookmarkCollection && (
                    <PrimaryButton
                        className="bg-success hover:bg-success/[0.8] mb-8 inline-flex items-center rounded-md px-4 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!isFormValid || form.processing}
                        onClick={submitForm}
                        data-testid="ipfs-step2-publish-button"
                    >
                        {form.processing ? (
                            <>
                                <Paragraph
                                    className="text-white"
                                    data-testid="step2-publishing-text"
                                >
                                    {t(
                                        'workflows.publishToIpfs.publishingToIpfs',
                                    )}
                                </Paragraph>
                            </>
                        ) : (
                            <>
                                <Paragraph
                                    className="text-white"
                                    data-testid="step2-publish-text"
                                >
                                    {t('workflows.publishToIpfs.publishToIpfs')}
                                </Paragraph>
                            </>
                        )}
                    </PrimaryButton>
                )}
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
