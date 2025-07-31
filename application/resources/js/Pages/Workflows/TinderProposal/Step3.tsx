import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';
import { ChevronLeft, ChevronRight, ThumbsUpIcon } from 'lucide-react';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { router } from '@inertiajs/react';
import api from '@/utils/axiosClient';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Title from '@/Components/atoms/Title';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import { shortNumber } from '@/utils/shortNumber';
import Button from '@/Components/atoms/Button';
import ThumbsDownIcon from '@/Components/svgs/ThumbsDownIcon';
import { TinderWorkflowParams } from '@/enums/tinder-workflow-params';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { SearchParams } from '@/types/search-params';

interface Step3Props {
    stepDetails: any[];
    activeStep: number;
    tinderCollection?: any;
    collectionHash?: string;
    filters: any;
    proposals?: {
        data: any[];
        total: number;
        current_page: number;
        last_page: number;
        per_page: number;
        from?: number;
        to?: number;
    } | null;
    selectedFund?: {
        id: number;
        title: string;
        slug: string;
    } | null;
    preferences?: {
        selectedFund: number;
        proposalTypes?: string[];
        proposalSizes?: string[];
        impactTypes?: string[];
    };
    existingSwipedLeft?: string[];
    existingSwipedRight?: string[];
    isLoadMore?: boolean;
    leftBookmarkCollectionHash?: string;
    rightBookmarkCollectionHash?: string;
    savedCurrentIndex?: number;
    savedTotalSeen?: number;
    startingPage?: number;
    currentIndexWithinPage?: number;
}

const Step3: React.FC<Step3Props> = ({
    stepDetails,
    activeStep,
    tinderCollection,
    collectionHash,
    proposals,
    selectedFund,
    preferences,
    filters,
    existingSwipedLeft = [],
    existingSwipedRight = [],
    leftBookmarkCollectionHash,
    rightBookmarkCollectionHash,
    isLoadMore = false,
    savedCurrentIndex = 0,
    savedTotalSeen = 0,
    startingPage = 1,
    currentIndexWithinPage = 0
}) => {
    const { t } = useLaravelReactI18n();
    const [currentIndex, setCurrentIndex] = useState(currentIndexWithinPage);
    const [isAnimating, setIsAnimating] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [swipeOffset, setSwipeOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
    const [swipedCardIndex, setSwipedCardIndex] = useState<number | null>(null);
    const [isButtonClick, setIsButtonClick] = useState(false);
    const currentDragOffset = useRef({ x: 0, y: 0 });

    // State for infinite scrolling
    const [allProposals, setAllProposals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [swipedLeftProposals, setSwipedLeftProposals] = useState<string[]>(Array.isArray(existingSwipedLeft) ? existingSwipedLeft : []);
    const [swipedRightProposals, setSwipedRightProposals] = useState<string[]>(Array.isArray(existingSwipedRight) ? existingSwipedRight : []);
    const [processingProposals, setProcessingProposals] = useState<Set<string>>(new Set());

    // Track current page - start from the calculated starting page
    const [currentPage, setCurrentPage] = useState(startingPage);

    useEffect(() => {
        const safeExistingSwipedLeft = Array.isArray(existingSwipedLeft) ? existingSwipedLeft : [];
        const safeExistingSwipedRight = Array.isArray(existingSwipedRight) ? existingSwipedRight : [];
    }, [swipedLeftProposals, swipedRightProposals, existingSwipedLeft, existingSwipedRight]);

    const editSettingsStep = generateLocalizedRoute('workflows.tinderProposal.index', {
        [TinderWorkflowParams.STEP]: 1,
        [TinderWorkflowParams.EDIT]: 1,
        [TinderWorkflowParams.TINDER_COLLECTION_HASH]: collectionHash,
        [TinderWorkflowParams.LEFT_BOOKMARK_COLLECTION_HASH]: leftBookmarkCollectionHash,
        [TinderWorkflowParams.RIGHT_BOOKMARK_COLLECTION_HASH]: rightBookmarkCollectionHash,
    });

    useEffect(() => {
        if (proposals?.data) {
            const safeExistingSwipedLeft = Array.isArray(existingSwipedLeft) ? existingSwipedLeft : [];
            const safeExistingSwipedRight = Array.isArray(existingSwipedRight) ? existingSwipedRight : [];
            const allSwipedSlugs = [...safeExistingSwipedLeft, ...safeExistingSwipedRight];

            if (isLoadMore) {
                // Append new proposals to existing ones, but filter out any already swiped proposals
                const filteredNewProposals = proposals.data.filter(proposal =>
                    !allSwipedSlugs.includes(proposal.slug)
                );
                setAllProposals(prev => [...prev, ...filteredNewProposals]);
            } else {
                // Replace with initial proposals, filtering out already swiped ones
                const filteredProposals = proposals.data.filter(proposal =>
                    !allSwipedSlugs.includes(proposal.slug)
                );
                setAllProposals(filteredProposals);

                // Set the current index to the index within the current page
                setCurrentIndex(currentIndexWithinPage);
            }

            setHasMorePages(proposals.current_page < proposals.last_page);
            setIsLoading(false);

        }
    }, [proposals, isLoadMore, existingSwipedLeft, existingSwipedRight, currentIndexWithinPage]);

    const buildUpdatedFilters = (updates: Partial<SearchParams> = {}) => {
        const baseFilters: Record<string, any> = { ...filters };

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                delete baseFilters[key];
            } else {
                baseFilters[key] = value;
            }
        });

        if (
            Object.keys(updates).length > 0 &&
            !updates[TinderWorkflowParams.PAGE] &&
            baseFilters[TinderWorkflowParams.PAGE]
        ) {
            baseFilters[TinderWorkflowParams.PAGE] = 1;
        }

        return baseFilters;
    };

    // Function to load more proposals
    const loadMoreProposals = () => {
        if (isLoading || !hasMorePages) return;

        setIsLoading(true);
        const nextPage = currentPage + 1;

        router.get(
            window.location.pathname,
            buildUpdatedFilters({
                [TinderWorkflowParams.PAGE]: nextPage,
                [TinderWorkflowParams.LOAD_MORE]: 1,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Update the local page state when the request succeeds
                    setCurrentPage(nextPage);
                },
                onError: () => {
                    setIsLoading(false);
                }
            }
        );
    };

    // Check if we need to load more proposals (when user is near the end)
    useEffect(() => {
        const remainingCards = allProposals.length - currentIndex;
        const threshold = 5; // Load more when 5 cards remaining (reduced from 10)

        // Don't auto-load more if we just returned to a saved page and haven't started swiping yet
        const isReturningToSavedPage = currentIndexWithinPage === 0 && currentIndex === 0 && startingPage > 1;

        if (remainingCards <= threshold && hasMorePages && !isLoading && allProposals.length > 0 && !isReturningToSavedPage) {
            loadMoreProposals();
        }
    }, [currentIndex, allProposals.length, hasMorePages, isLoading, currentIndexWithinPage, startingPage]);



    const handleCardSwipe = (direction: 'left' | 'right', fromButton: boolean = false) => {
        if (isAnimating || !allProposals || currentIndex >= allProposals.length) return;

        const currentProposal = allProposals[currentIndex];
        const proposalSlug = currentProposal?.slug;
        const proposalHash = currentProposal?.hash;

        setIsAnimating(true);
        setSwipeDirection(direction);
        setIsDragging(false); // Stop dragging immediately
        setIsButtonClick(fromButton); // Track if this was initiated by a button click
        setSwipedCardIndex(currentIndex); // Mark current card as swiped

        // Reset drag offset and set swipe offset for animation
        setDragOffset({ x: 0, y: 0 });
        const offScreenX = direction === 'right' ? 600 : -600; // Increased distance for smoother exit
        setSwipeOffset({ x: offScreenX, y: 0 });

        // Update local state immediately for responsive UI
        if (proposalSlug) {
            if (direction === 'left') {
                setSwipedLeftProposals(prev => [...prev, proposalSlug]);
            } else {
                setSwipedRightProposals(prev => [...prev, proposalSlug]);
            }
        }

        if (proposalSlug && proposalHash) {
            if (!processingProposals.has(proposalSlug)) {

                setProcessingProposals(prev => new Set(prev).add(proposalSlug));

                const targetCollectionHash = direction === 'left'
                    ? leftBookmarkCollectionHash
                    : rightBookmarkCollectionHash;

                if (targetCollectionHash) {
                    api.post(route('en.workflows.tinderProposal.addBookmarkItem'), {
                    proposalHash,
                    modelType: 'proposals',
                    bookmarkCollection: targetCollectionHash
            })
                        .then(() => {
                        })
                        .catch((error) => {
                            console.error('Failed to save bookmark:', error);
                        })
                        .finally(() => {
                            // Clean up processing state
                            setProcessingProposals(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(proposalSlug);
                                return newSet;
                            });
                        });
                }
            }
        } else {
            console.warn('No slug or hash found for proposal:', currentProposal);
        }

        // After animation completes, advance to next card and clean up
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setIsAnimating(false);
            setSwipeDirection(null);
            setSwipedCardIndex(null);
            setIsButtonClick(false);
            setSwipeOffset({ x: 0, y: 0 });
            currentDragOffset.current = { x: 0, y: 0 };
        }, 300);
    };

    const handleDragStart = (clientX: number, clientY: number) => {
        if (isAnimating) return;
        setIsDragging(true);
        setDragStart({ x: clientX, y: clientY });
    };

    const handleDragMove = (clientX: number, clientY: number) => {
        if (!isDragging || isAnimating) return;

        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;

        // Update both state and ref
        const newOffset = { x: deltaX, y: deltaY };
        setDragOffset(newOffset);
        currentDragOffset.current = newOffset;
    };

    const handleDragEnd = () => {
        if (!isDragging || isAnimating) return;

        // Use the ref value instead of state for immediate access
        const finalOffset = currentDragOffset.current;
        const swipeThreshold = 100;
        const absX = Math.abs(finalOffset.x);

        if (absX > swipeThreshold) {
            // Swipe detected - trigger swipe animation
            const direction = finalOffset.x > 0 ? 'right' : 'left';
            handleCardSwipe(direction);
        } else {
            // Snap back to center
            setIsDragging(false);
            setDragOffset({ x: 0, y: 0 });
            currentDragOffset.current = { x: 0, y: 0 };
        }
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleDragStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        handleDragEnd();
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
        handleDragEnd();
    };

    // Render cards with complete isolation between swiped and normal cards
    const getCardsToRender = useMemo(() => {
        if (!allProposals || allProposals.length === 0) return [];

        // During animation, show both the swiped card and the upcoming cards
        if (swipedCardIndex !== null && isAnimating && allProposals[swipedCardIndex]) {
            const swipedCard = allProposals[swipedCardIndex];
            const nextCards = allProposals.slice(currentIndex + 1, currentIndex + 4);

            return [
                { ...swipedCard, _isSwipedCard: true, _originalIndex: swipedCardIndex },
                ...nextCards.map((card, idx) => ({ ...card, _isSwipedCard: false, _originalIndex: currentIndex + 1 + idx }))
            ].filter(Boolean);
        }

        // Normal state: show current + next 2 cards
        return allProposals.slice(currentIndex, currentIndex + 3).map((card, idx) => ({
            ...card,
            _isSwipedCard: false,
            _originalIndex: currentIndex + idx
        }));
    }, [allProposals, currentIndex, swipedCardIndex, isAnimating]);

    const cardsToRender = getCardsToRender;

    // Check if we have a top card that can be dragged
    const hasTopCard = cardsToRender.length > 0 && !cardsToRender[0]._isSwipedCard && !isAnimating;

    // Add global event listeners for mouse/touch events
    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                handleDragMove(e.clientX, e.clientY);
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleDragEnd();
            }
        };

        const handleGlobalTouchMove = (e: TouchEvent) => {
            if (isDragging && e.touches[0]) {
                handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const handleGlobalTouchEnd = () => {
            if (isDragging) {
                handleDragEnd();
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            document.addEventListener('touchmove', handleGlobalTouchMove);
            document.addEventListener('touchend', handleGlobalTouchEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('touchmove', handleGlobalTouchMove);
            document.removeEventListener('touchend', handleGlobalTouchEnd);
        };
    }, [isDragging, dragStart]);

    // Handle validation and redirect if needed
    useEffect(() => {
        // Redirect to step 1 if no preferences are found
        if (!preferences || !preferences.selectedFund) {
            router.visit(generateLocalizedRoute('workflows.tinderProposal.index', { [TinderWorkflowParams.STEP]: 1 }));
        }
    }, [preferences]);

    const goToStep4 = () => {
        // Navigate to step 4 with collection hashes
        router.visit(
            generateLocalizedRoute('workflows.tinderProposal.index', {
                [TinderWorkflowParams.STEP]: 4,
                [TinderWorkflowParams.TINDER_COLLECTION_HASH]: collectionHash,
                [TinderWorkflowParams.LEFT_BOOKMARK_COLLECTION_HASH]: leftBookmarkCollectionHash,
                [TinderWorkflowParams.RIGHT_BOOKMARK_COLLECTION_HASH]: rightBookmarkCollectionHash,
            })
        );
    };

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{
                preserveScroll: true,
            }}
        >
            <WorkflowLayout
                asideInfo={stepDetails[activeStep - 1]?.info || ''}
                wrapperClassName="!h-auto"
                contentClassName="!max-h-none"
            >
                <Nav stepDetails={stepDetails} activeStep={activeStep} />


                <div className="flex flex-col bg-background  h-220  pt-30" >
                    <div className="rounded-lg p-6 scrolling-touch">
                        {allProposals && allProposals.length > 0 ? (
                            <div className="space-y-4 w-full flex flex-col items-center justify-center">
                                {/* Stack of cards */}
                                <div className="relative w-full max-w-md ">
                                    {cardsToRender.map((proposal: any, index: number) => {
                                        // Use the flag to determine if this is the swiped card
                                        const isSwipedCard = proposal._isSwipedCard === true;

                                        // Use the original index as a stable key to prevent rerendering
                                        const stableKey = `${proposal.hash || proposal.id}-${proposal._originalIndex}`;

                                        // Calculate stack position
                                        let stackPosition = index;
                                        if (isSwipedCard) {
                                            stackPosition = -1; // Swiped card is above the stack
                                        } else if (isAnimating && swipedCardIndex !== null) {
                                            // During animation, normal cards should be positioned as if they're the new stack
                                            stackPosition = index - 1;
                                        }

                                        // Only non-swiped cards at position 0 can be interactive
                                        const isTopCard = !isSwipedCard && stackPosition === 0 && !isAnimating;

                                        // Calculate visual properties based on stack position
                                        const zIndex = isSwipedCard ? 100 : (10 - Math.max(0, stackPosition));
                                        const scale = isSwipedCard ? 1 : (1 - (Math.max(0, stackPosition) * 0.08));
                                        const translateY = isSwipedCard ? 0 : -(Math.max(0, stackPosition) * 60);
                                        const baseOpacity = isSwipedCard ? 1 : (1 - (Math.max(0, stackPosition) * 0.05));
                                        const blur = isSwipedCard ? 0 : (Math.max(0, stackPosition) * 2);

                                        // Apply transforms - ONLY to the specific card type
                                        let dragX = 0;
                                        let dragY = 0;
                                        let rotation = 0;

                                        if (isSwipedCard && isAnimating) {
                                            // ONLY the swiped card during animation gets swipe transform
                                            dragX = swipeOffset.x;
                                            dragY = swipeOffset.y * 0.1;
                                            // Enhanced rotation with more natural feel
                                            rotation = Math.min(Math.max(swipeOffset.x * 0.15, -30), 30);
                                        } else if (isTopCard && isDragging && !isAnimating) {
                                            // ONLY the top card during drag gets drag transform
                                            dragX = dragOffset.x;
                                            dragY = dragOffset.y * 0.1;
                                            rotation = Math.min(Math.max(dragOffset.x * 0.1, -15), 15);
                                        }
                                        // All other cards: dragX = 0, dragY = 0, rotation = 0

                                        // Opacity calculations
                                        let cardOpacity = baseOpacity;
                                        if (isSwipedCard && isAnimating) {
                                            // Smoother fade out with easing curve
                                            const progress = Math.abs(swipeOffset.x) / 600;
                                            cardOpacity = Math.max(0, 1 - (progress * progress)); // Quadratic easing
                                        } else if (isTopCard && isDragging) {
                                            cardOpacity = Math.max(0.3, 1 - Math.abs(dragOffset.x) / 300);
                                        }

                                        return (
                                            <div
                                                key={stableKey}
                                                className={`absolute inset-0 w-full ${isTopCard ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
                                                    } ${
                                                    // Apply smooth transitions for swipe animation or stack positioning
                                                    isSwipedCard && isAnimating ? 'transition-all duration-300 ease-out' :
                                                        !isSwipedCard && !isDragging ? 'transition-all duration-300 ease-out' : ''
                                                    }`}
                                                style={{
                                                    zIndex,
                                                    transform: `translateY(${translateY + dragY}px) translateX(${dragX}px) scale(${scale}) rotate(${rotation}deg)`,
                                                    opacity: cardOpacity,
                                                    filter: `blur(${blur}px)`,
                                                }}
                                                onMouseDown={isTopCard && !isAnimating ? handleMouseDown : undefined}
                                                onTouchStart={isTopCard && !isAnimating ? handleTouchStart : undefined}
                                            >
                                                <div className="flex flex-col w-full rounded-lg relative">
                                                    <ProposalCard
                                                        proposal={proposal}
                                                        isHorizontal={false}
                                                        hideFooter={true}
                                                    />

                                                    {isTopCard && (
                                                        <div className="flex justify-center mt-4 w-full">
                                                            <div className="flex w-full relative">
                                                                {/* No Button */}
                                                                <Button
                                                                    onClick={() => handleCardSwipe('left', true)}
                                                                    disabled={!hasTopCard || isAnimating}
                                                                    className="flex-1 flex items-center bg-background justify-center py-3 px-6 rounded-l-lg rounded-r-none hover:bg-error-light/[30%] active:bg-error-light/[70%] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-light border-r-0"
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-6 h-6 flex items-center justify-center">
                                                                            <ThumbsDownIcon width={18} height={18} />
                                                                        </div>
                                                                        <Paragraph>{t('workflows.tinderProposal.step3.noButtonText')}</Paragraph>
                                                                        <Paragraph className="text-sm text-gray-light">({swipedLeftProposals.length})</Paragraph>
                                                                    </div>
                                                                </Button>

                                                                {/* Separator Line */}
                                                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-light transform -translate-x-1/2 z-10"></div>

                                                                {/* Yes Button */}
                                                                <Button
                                                                    onClick={() => handleCardSwipe('right', true)}
                                                                    disabled={!hasTopCard || isAnimating}
                                                                    className="flex-1 flex items-center bg-background justify-center py-3 px-6 rounded-r-lg rounded-l-none hover:bg-success-light active:bg-success-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-light border-l-0"
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-6 h-6 flex items-center justify-center">
                                                                            <ThumbsUpIcon width={18} height={18} className="text-success" />
                                                                        </div>
                                                                        <Paragraph>{t('workflows.tinderProposal.step3.yesButtonText')}</Paragraph>
                                                                        <Paragraph className=" text-gray-light">({swipedRightProposals.length})</Paragraph>
                                                                    </div>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* No more cards message */}
                                    {currentIndex >= allProposals.length && !isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                                                <Paragraph className="text-lg font-semibold mb-2">
                                                    {t('workflows.tinderProposal.step3.allDone')}
                                                </Paragraph>
                                                <Paragraph className="text-gray-600">
                                                    {t('workflows.tinderProposal.step3.viewedAllProposals', { count: allProposals.length })}
                                                </Paragraph>
                                            </div>
                                        </div>
                                    )}

                                    {/* Loading indicator */}
                                    {isLoading && currentIndex >= allProposals.length && (
                                        <div className="absolute bg-background inset-0 flex items-center justify-center w-full">
                                            <div className="text-center p-8 ">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : proposals === null ? (
                            <div className="text-center">
                                <Paragraph className="text-error">
                                    {t('workflows.tinderProposal.step3.failedToLoadProposals')}
                                </Paragraph>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Paragraph>
                                    {isLoading ? t('workflows.tinderProposal.step3.loadingProposals') : t('workflows.tinderProposal.step3.noProposalsFound')}
                                </Paragraph>
                                {isLoading && (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mt-4"></div>
                                )}
                            </div>
                        )}
                    </div>


                </div>
                <Footer>
                    <div className="flex flex-col space-y-4 w-full items-center justify-center">
                        <PrimaryButton onClick={goToStep4} className="px-8 w-[75%] py-3 text-sm">
                            {t('workflows.tinderProposal.step3.saveProgress')}
                        </PrimaryButton>
                        <PrimaryLink
                            href={editSettingsStep}
                            className="text-sm  lg:px-8 lg:py-3 w-[75%]  bg-background border border-gray-persist/[20%]"
                        >
                            <Paragraph className='text-content' size='sm'>{t('workflows.tinderProposal.step3.editSettings')}</Paragraph>
                        </PrimaryLink>
                    </div>
                </Footer>
            </WorkflowLayout>
        </FiltersProvider>
    );
};

export default Step3;
