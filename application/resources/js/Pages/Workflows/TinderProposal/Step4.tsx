import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, router, useForm } from '@inertiajs/react';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { StatusEnum, VisibilityEnum } from '@/enums/votes-enums';
import { TinderWorkflowParams } from '@/enums/tinder-workflow-params';
import { useWorkflowSlideOver } from '@/hooks/useWorkflowSlideOver';
import { useList, ListProvider } from '@/Context/ListContext';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import ProposalData = App.DataTransferObjects.ProposalData;
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import Title from '@/Components/atoms/Title';
import SlideOverContent from './Partials/SlideOverContent';
import SwipeCard from './Partials/SwipeCard';

interface Step4Props {
    stepDetails: any[];
    activeStep: number;
    leftBookmarkCollection?: BookmarkCollectionData;
    rightBookmarkCollection?: BookmarkCollectionData;
    tinderCollectionHash?: string;
    leftProposals: Array<{ proposal: ProposalData, bookmark_item_hash: string }>;
    rightProposals: Array<{ proposal: ProposalData, bookmark_item_hash: string }>;
}

const Step4: React.FC<Step4Props> = (props) => {
    return (
        <ListProvider>
            <Step4Content {...props} />
        </ListProvider>
    );
};

const Step4Content: React.FC<Step4Props> = ({
    stepDetails,
    activeStep,
    leftBookmarkCollection,
    rightBookmarkCollection,
    leftProposals: initialLeftProposals,
    rightProposals: initialRightProposals,
    tinderCollectionHash
}) => {
    const { t } = useTranslation();
    const { isOpen, openSlideOver, closeSlideOver } = useWorkflowSlideOver();
    const [leftProposals, setLeftProposals] = useState(initialLeftProposals);
    const [rightProposals, setRightProposals] = useState(initialRightProposals);
    const [deletedCollections, setDeletedCollections] = useState<Set<'left' | 'right'>>(new Set());
    const [editingCollection, setEditingCollection] = useState<'left' | 'right' | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isEditingFields, setIsEditingFields] = useState(false);

    const editForm = useForm({
        [TinderWorkflowParams.TITLE]: '',
        [TinderWorkflowParams.CONTENT]: '',
        [TinderWorkflowParams.VISIBILITY]: VisibilityEnum.PRIVATE,
        [TinderWorkflowParams.COMMENTS_ENABLED]: false as boolean,
        [TinderWorkflowParams.COLOR]: '#2596BE',
        [TinderWorkflowParams.STATUS]: StatusEnum.DRAFT,
    });

    const leftSwipeCount = leftProposals.length;
    const rightSwipeCount = rightProposals.length;

    useEffect(() => {
        validateEditForm();
    }, [editForm.data]);

    const validateEditForm = () => {
        const newErrors: Record<string, string> = {};

        if (!editForm.data[TinderWorkflowParams.TITLE].trim()) {
            newErrors[TinderWorkflowParams.TITLE] = 'Title is required';
        }

        if (editForm.data[TinderWorkflowParams.CONTENT].length < 50) {
            newErrors[TinderWorkflowParams.CONTENT] = t('workflows.tinderProposal.step2.descriptionMinLength50');
        }

        setFormErrors(newErrors);

        setIsFormValid(
            Object.keys(newErrors).length === 0 &&
            !!editForm.data[TinderWorkflowParams.TITLE] &&
            editForm.data[TinderWorkflowParams.CONTENT].length >= 50,
        );
    };

    // Handle saving edit form
    const saveEditForm = () => {
        if (!isFormValid || !editingCollection) return;

        const collection = editingCollection === 'left' ? leftBookmarkCollection : rightBookmarkCollection;

        if (!collection?.hash) return;

        // Make API call to update the bookmark collection
        editForm.post(
            route('api.collections.update', {
                bookmarkCollection: collection.hash,
            }),
            {
                onSuccess: () => {
                    closeSlideOver();
                    setEditingCollection(null);
                    setIsEditingFields(false);
                },
                onError: (errors) => {
                    console.error('Error updating bookmark collection:', errors);
                },
            },
        );
    };

    const handleEditList = (type: 'left' | 'right') => {
        const collection = type === 'left' ? leftBookmarkCollection : rightBookmarkCollection;
        setEditingCollection(type);
        setIsEditingFields(false); 
        // Pre-fill the form with existing collection data
        if (collection) {
            editForm.setData({
                [TinderWorkflowParams.TITLE]: collection.title || (type === 'left' ? t('workflows.tinderProposal.step4.defaultTitles.passedProposals') : t('workflows.tinderProposal.step4.defaultTitles.likedProposals')),
                [TinderWorkflowParams.CONTENT]: collection.content || (type === 'left'
                    ? t('workflows.tinderProposal.step4.defaultDescriptions.passedProposals')
                    : t('workflows.tinderProposal.step4.defaultDescriptions.likedProposals')),
                [TinderWorkflowParams.VISIBILITY]: (collection.visibility as VisibilityEnum) || VisibilityEnum.PRIVATE,
                [TinderWorkflowParams.COMMENTS_ENABLED]: collection.allow_comments || false,
                [TinderWorkflowParams.COLOR]: collection.color || (type === 'left' ? '#EF4444' : '#22C55E'),
                [TinderWorkflowParams.STATUS]: (collection.status as StatusEnum) || StatusEnum.DRAFT,
            });
        } 

        openSlideOver();
    };

    const handleDeleteCollection = async () => {
        const collectionToDelete = editingCollection;
        if (!collectionToDelete) return;

        const collection = collectionToDelete === 'left' ? leftBookmarkCollection : rightBookmarkCollection;
        if (!collection?.hash) return;

        try {
            await router.post(
                route('api.collections.delete', {
                    bookmarkCollection: collection.hash,
                }),
                {
                    no_redirect: true,
                },
                {
                    onSuccess: () => {
                        // Mark this collection as deleted
                        setDeletedCollections(prev => new Set(prev).add(collectionToDelete));
                        // Close the slide over
                        closeSlideOver();
                        setIsEditingFields(false);
                    },
                    onError: (errors) => {
                        console.error('Failed to delete collection:', errors);
                    },
                }
            );
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };

    const toggleEditingFields = () => {
        setIsEditingFields(!isEditingFields);
    };

    const slideOverContent = (
        <SlideOverContent
            editForm={editForm}
            formErrors={formErrors}
            isFormValid={isFormValid}
            isEditingFields={isEditingFields}
            onToggleEditingFields={toggleEditingFields}
            onSaveEditForm={saveEditForm}
            onDeleteCollection={handleDeleteCollection}
        />
    );

    const keepSwipingStep = generateLocalizedRoute('workflows.tinderProposal.index', {
        [TinderWorkflowParams.STEP]: 3,
        [TinderWorkflowParams.TINDER_COLLECTION_HASH]: tinderCollectionHash,
        [TinderWorkflowParams.LEFT_BOOKMARK_COLLECTION_HASH]: leftBookmarkCollection?.hash,
        [TinderWorkflowParams.RIGHT_BOOKMARK_COLLECTION_HASH]: rightBookmarkCollection?.hash,
    });

    const refineInterestsStep = generateLocalizedRoute('workflows.tinderProposal.index', {
            [TinderWorkflowParams.STEP]: 1,
            [TinderWorkflowParams.EDIT]: 1,
            [TinderWorkflowParams.TINDER_COLLECTION_HASH]: tinderCollectionHash,
            [TinderWorkflowParams.LEFT_BOOKMARK_COLLECTION_HASH]: leftBookmarkCollection?.hash,
            [TinderWorkflowParams.RIGHT_BOOKMARK_COLLECTION_HASH]: rightBookmarkCollection?.hash,
    });

    return (
        <WorkflowLayout 
            asideInfo={stepDetails[activeStep - 1]?.info || ''}
            slideOver={{
                isOpen,
                onClose: closeSlideOver,
                title: t('workflows.tinderProposal.step4.editListTitle'),
                size: 'md',
                content: slideOverContent
            }}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />
            <div className="flex flex-col mx-auto w-full items-center justify-center   max-h-[55vh] mt-5">
            <div className="mx-auto w-[75%] xl:w-[50%] overflow-y-auto mx-5">
                <Title className="text-center text-lg font-black mb-2 mt-5 text-content">{t('workflows.tinderProposal.step4.swipeList')}</Title>
                <Paragraph size='sm' className="text-center text-md  mb-8 text-gray-persist">
                    {t('workflows.tinderProposal.step4.organizeSwipesDescription')}
                </Paragraph>
                <div className="space-y-5">
                    {/* Right Swipes Card */}
                    {rightBookmarkCollection && (
                        <SwipeCard
                            type="right"
                            bookmarkCollection={rightBookmarkCollection}
                            swipeCount={rightSwipeCount}
                            onEditList={() => handleEditList('right')}
                            isDeleted={deletedCollections.has('right')}
                        />
                    )}
                    
                    {/* Left Swipes Card */}
                    {leftBookmarkCollection && (
                        <SwipeCard
                            type="left"
                            bookmarkCollection={leftBookmarkCollection}
                            swipeCount={leftSwipeCount}
                            onEditList={() => handleEditList('left')}
                            isDeleted={deletedCollections.has('left')}
                        />
                    )}
                </div>

                {/* Show message when both collections are deleted or don't exist */}
                {(!leftBookmarkCollection || deletedCollections.has('left')) && (!rightBookmarkCollection || deletedCollections.has('right')) && (
                    <div className="text-center py-8">
                        <Paragraph size='sm' className="text-gray-persist text-lg">
                            {(deletedCollections.has('left') || deletedCollections.has('right'))
                                ? t('workflows.tinderProposal.step4.allCollectionsDeleted')
                                : t('workflows.tinderProposal.step4.noCollectionsAvailable')}
                        </Paragraph>
                        <Paragraph size='sm' className="text-gray-persist mt-2">
                            {(deletedCollections.has('left') || deletedCollections.has('right'))
                                ? t('workflows.tinderProposal.step4.continueSwipingMessage')
                                : t('workflows.tinderProposal.step4.startSwipingMessage')}
                        </Paragraph>
                    </div>
                )}
            </div>
            </div>

            <Footer>
                <div className="flex flex-col items-center justify-center w-full px-5 lg:px-15 pb-4">
                    <PrimaryLink
                        href={keepSwipingStep}
                        className="text-sm w-[100%] lg:px-8 lg:py-3"
                    >
                        <Paragraph size='sm'>{t('workflows.tinderProposal.step4.keepSwiping')}</Paragraph>
                    </PrimaryLink>
                    <PrimaryLink
                        href={refineInterestsStep}
                        className="text-sm w-[100%] xl-[75%] bg-background lg:px-8 lg:py-3"
                    >
                        <Paragraph size='sm' className='text-primary'>{t('workflows.tinderProposal.step4.refineMyInterests')}</Paragraph>
                    </PrimaryLink>
                </div>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step4;