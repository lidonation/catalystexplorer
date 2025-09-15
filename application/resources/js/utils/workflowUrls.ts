import { useLocalizedRoute } from '@/utils/localizedRoute';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

/**
 * Generates workflow URLs for different bookmark collection types
 */
export const useWorkflowUrl = (bookmarkCollection: BookmarkCollectionData, step: number = 3): string => {
    const useLocalizedRouteHook = useLocalizedRoute;

    switch (bookmarkCollection.list_type) {
        case 'voter':
            return useLocalizedRouteHook('workflows.createVoterList.index', {
                step,
                bookmarkCollection: bookmarkCollection.id
            });

        case 'tinder':
            return useLocalizedRouteHook('workflows.tinderProposal.index', {
                step,
                leftBookmarkCollectionHash: bookmarkCollection.workflow_params?.leftBookmarkCollectionHash,
                rightBookmarkCollectionHash: bookmarkCollection.workflow_params?.rightBookmarkCollectionHash,
                tinderCollectionHash: bookmarkCollection.workflow_params?.tinderCollectionHash
            });

        case 'normal':
            return useLocalizedRouteHook('workflows.bookmarks.index', {
                step,
                bookmarkCollection: bookmarkCollection.id
            });

        default:
            return '';
    }
};

/**
 * Helper function to get workflow URL parameters for a bookmark collection
 */
export const getWorkflowUrlParams = (bookmarkCollection: BookmarkCollectionData, step: number = 3) => {
    switch (bookmarkCollection.list_type) {
        case 'voter':
            return {
                routeName: 'workflows.createVoterList.index',
                params: {
                    step,
                    bookmarkCollection: bookmarkCollection.id
                }
            };

        case 'tinder':
            return {
                routeName: 'workflows.tinderProposal.index',
                params: {
                    step,
                    leftBookmarkCollectionHash: bookmarkCollection.workflow_params?.leftBookmarkCollectionHash,
                    rightBookmarkCollectionHash: bookmarkCollection.workflow_params?.rightBookmarkCollectionHash,
                    tinderCollectionHash: bookmarkCollection.workflow_params?.tinderCollectionHash
                }
            };

        case 'normal':
            return {
                routeName: 'workflows.bookmarks.index',
                params: {
                    step,
                    bookmarkCollection: bookmarkCollection.id
                }
            };

        default:
            return {
                routeName: '',
                params: {}
            };
    }
};
