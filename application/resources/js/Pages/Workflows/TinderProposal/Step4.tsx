import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { ListProvider } from '@/Context/ListContext';
import { TinderWorkflowParams } from '@/enums/tinder-workflow-params';
import { StatusEnum, VisibilityEnum } from '@/enums/votes-enums';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import SlideOverContent from './Partials/SlideOverContent';
import SwipeCard from './Partials/SwipeCard';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import ProposalData = App.DataTransferObjects.ProposalData;
import { useWorkflowSlideOver } from '@/hooks/useWorkflowSlideOver';

interface Step4Props {
    stepDetails: any[];
    activeStep: number;
    leftBookmarkCollection?: BookmarkCollectionData;
    rightBookmarkCollection?: BookmarkCollectionData;
    tinderCollectionHash?: string;
    leftProposals: Array<{
        proposal: ProposalData;
        bookmark_item_hash: string;
    }>;
    rightProposals: Array<{
        proposal: ProposalData;
        bookmark_item_hash: string;
    }>;
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
    tinderCollectionHash,
}) => {
    const { t } = useTranslation();
    const { isOpen, openSlideOver, closeSlideOver } = useWorkflowSlideOver();
    const [leftProposals, setLeftProposals] = useState(initialLeftProposals);
    const [rightProposals, setRightProposals] = useState(initialRightProposals);
    const [deletedCollections, setDeletedCollections] = useState<
        Set<'left' | 'right'>
    >(new Set());
    const [editingCollection, setEditingCollection] = useState<
        'left' | 'right' | null
    >(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isEditingFields, setIsEditingFields] = useState(false);

    const editForm = useForm({
        [TinderWorkflowParams.TITLE]: leftBookmarkCollection?.title || rightBookmarkCollection?.title || '',
        [TinderWorkflowParams.CONTENT]: leftBookmarkCollection?.content || rightBookmarkCollection?.content || '',
        [TinderWorkflowParams.VISIBILITY]: leftBookmarkCollection?.visibility || rightBookmarkCollection?.visibility || VisibilityEnum.PRIVATE,
        [TinderWorkflowParams.COMMENTS_ENABLED]: leftBookmarkCollection?.allow_comments || rightBookmarkCollection?.allow_comments || false as boolean,
        [TinderWorkflowParams.COLOR]: leftBookmarkCollection?.color || rightBookmarkCollection?.color || '#2596BE',
        [TinderWorkflowParams.STATUS]: leftBookmarkCollection?.status || leftBookmarkCollection?.status || StatusEnum.DRAFT,
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
            newErrors[TinderWorkflowParams.CONTENT] = t(
                'workflows.tinderProposal.step2.descriptionMinLength50',
            );
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
        if (!isFormValid) return;

        const collection =
            editingCollection === 'left'
                ? leftBookmarkCollection
                : rightBookmarkCollection;

        if (!collection?.hash) return;

        // Make API call to update the bookmark collection
        editForm.post(
            route('api.collections.update', {
                bookmarkCollection: collection.hash,
            }),
            {
                onSuccess: () => {
                    // closeSlideOver();
                    //setIsEditingFields(false);
                },
                onError: (errors) => {
                    console.error(
                        'Error updating bookmark collection:',
                        errors,
                    );
                },
            },
        );
    };

    const handleEditList = (type: 'left' | 'right') => {
        const collection =
            type === 'left' ? leftBookmarkCollection : rightBookmarkCollection;
        setEditingCollection(type);
        setIsEditingFields(false);
        // Pre-fill the form with existing collection data
        if (collection) {
            editForm.setData({
                [TinderWorkflowParams.TITLE]:
                    collection.title ||
                    (type === 'left'
                        ? t(
                              'workflows.tinderProposal.step4.defaultTitles.passedProposals',
                          )
                        : t(
                              'workflows.tinderProposal.step4.defaultTitles.likedProposals',
                          )),
                [TinderWorkflowParams.CONTENT]:
                    collection.content ||
                    (type === 'left'
                        ? t(
                              'workflows.tinderProposal.step4.defaultDescriptions.passedProposals',
                          )
                        : t(
                              'workflows.tinderProposal.step4.defaultDescriptions.likedProposals',
                          )),
                [TinderWorkflowParams.VISIBILITY]:
                    (collection.visibility as VisibilityEnum) ||
                    VisibilityEnum.PRIVATE,
                [TinderWorkflowParams.COMMENTS_ENABLED]:
                    collection.allow_comments || false,
                [TinderWorkflowParams.COLOR]:
                    collection.color ||
                    (type === 'left' ? '#EF4444' : '#22C55E'),
                [TinderWorkflowParams.STATUS]:
                    (collection.status as StatusEnum) || StatusEnum.DRAFT,
            });
        }

        openSlideOver();
    };

    const handleDeleteCollection = async () => {
        const collectionToDelete = editingCollection;
        if (!collectionToDelete) return;

        const collection =
            collectionToDelete === 'left'
                ? leftBookmarkCollection
                : rightBookmarkCollection;
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
                        setDeletedCollections((prev) =>
                            new Set(prev).add(collectionToDelete),
                        );
                        // Close the slide over
                        // closeSlideOver();
                        setIsEditingFields(false);
                    },
                    onError: (errors) => {
                        console.error('Failed to delete collection:', errors);
                    },
                },
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

    const keepSwipingStep = generateLocalizedRoute(
        'workflows.tinderProposal.index',
        {
            [TinderWorkflowParams.STEP]: 3,
            [TinderWorkflowParams.TINDER_COLLECTION_HASH]: tinderCollectionHash,
            [TinderWorkflowParams.LEFT_BOOKMARK_COLLECTION_HASH]:
                leftBookmarkCollection?.hash,
            [TinderWorkflowParams.RIGHT_BOOKMARK_COLLECTION_HASH]:
                rightBookmarkCollection?.hash,
        },
    );

    const refineInterestsStep = generateLocalizedRoute(
        'workflows.tinderProposal.index',
        {
            [TinderWorkflowParams.STEP]: 1,
            [TinderWorkflowParams.EDIT]: 1,
            [TinderWorkflowParams.TINDER_COLLECTION_HASH]: tinderCollectionHash,
            [TinderWorkflowParams.LEFT_BOOKMARK_COLLECTION_HASH]:
                leftBookmarkCollection?.hash,
            [TinderWorkflowParams.RIGHT_BOOKMARK_COLLECTION_HASH]:
                rightBookmarkCollection?.hash,
        },
    );

    return (
        <WorkflowLayout
            asideInfo={stepDetails[activeStep - 1]?.info || ''}
            slideOver={{
                isOpen: isOpen,
                onClose: () => closeSlideOver(),
                title: t('workflows.tinderProposal.step4.editListTitle'),
                size: 'md',
                content: slideOverContent,
            }}
            wrapperClassName="!h-auto"
            contentClassName="!max-h-none"
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />
            <div className="mx-auto mt-5 flex w-full flex-col items-center justify-center">
                <div className="mx-5 mx-auto w-[75%] overflow-y-auto xl:w-[50%]">
                    <Title className="text-content mt-5 mb-2 text-center text-lg font-black">
                        {t('workflows.tinderProposal.step4.swipeList')}
                    </Title>
                    <Paragraph
                        size="sm"
                        className="text-md text-gray-persist mb-8 text-center"
                    >
                        {t(
                            'workflows.tinderProposal.step4.organizeSwipesDescription',
                        )}
                    </Paragraph>
                    <div className="space-y-5 p-4">
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
                    {(!leftBookmarkCollection ||
                        deletedCollections.has('left')) &&
                        (!rightBookmarkCollection ||
                            deletedCollections.has('right')) && (
                            <div className="py-8 text-center">
                                <Paragraph
                                    size="sm"
                                    className="text-gray-persist text-lg"
                                >
                                    {deletedCollections.has('left') ||
                                    deletedCollections.has('right')
                                        ? t(
                                              'workflows.tinderProposal.step4.allCollectionsDeleted',
                                          )
                                        : t(
                                              'workflows.tinderProposal.step4.noCollectionsAvailable',
                                          )}
                                </Paragraph>
                                <Paragraph
                                    size="sm"
                                    className="text-gray-persist mt-2"
                                >
                                    {deletedCollections.has('left') ||
                                    deletedCollections.has('right')
                                        ? t(
                                              'workflows.tinderProposal.step4.continueSwipingMessage',
                                          )
                                        : t(
                                              'workflows.tinderProposal.step4.startSwipingMessage',
                                          )}
                                </Paragraph>
                            </div>
                        )}
                </div>
                <div className="flex w-[75%] flex-col items-center justify-center px-5 pb-4 lg:px-15">
                    <PrimaryLink
                        href={keepSwipingStep}
                        className="w-[100%] text-sm lg:px-8 lg:py-3"
                    >
                        <Paragraph size="sm">
                            {t('workflows.tinderProposal.step4.keepSwiping')}
                        </Paragraph>
                    </PrimaryLink>
                    <PrimaryLink
                        href={refineInterestsStep}
                        className="xl-[75%] bg-background w-[100%] text-sm lg:px-8 lg:py-3"
                    >
                        <Paragraph size="sm" className="text-primary">
                            {t(
                                'workflows.tinderProposal.step4.refineMyInterests',
                            )}
                        </Paragraph>
                    </PrimaryLink>
                </div>
            </div>
        </WorkflowLayout>
    );
};

export default Step4;
