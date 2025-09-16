import BookmarkCollectionPage from './BookmarkCollectionPage';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import CommunityData = App.DataTransferObjects.CommunityData;
import ProposalData = App.DataTransferObjects.ProposalData;
import GroupData = App.DataTransferObjects.GroupData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;

type BookmarkCollectionListProps =
    | {
        type: 'proposals';
        proposals: PaginatedData<ProposalData[]>;
        bookmarkCollection: BookmarkCollectionData;
        filters: SearchParams;
        pendingInvitations?: any[];
    }
    | {
        type: 'communities';
        communities: PaginatedData<CommunityData[]>;
        bookmarkCollection: BookmarkCollectionData;
        filters: SearchParams;
        pendingInvitations?: any[];
    }
    | {
        type: 'groups';
        groups: PaginatedData<GroupData[]>;
        bookmarkCollection: BookmarkCollectionData;
        filters: SearchParams;
        pendingInvitations?: any[];
    }
    | {
        type: 'ideascaleProfiles';
        ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
        bookmarkCollection: BookmarkCollectionData;
        filters: SearchParams;
        pendingInvitations?: any[];
    }
    | {
        type: 'reviews';
        reviews: PaginatedData<ReviewData[]>;
        bookmarkCollection: BookmarkCollectionData;
        filters: SearchParams;
        pendingInvitations?: any[];
    };

const Manage = (props: BookmarkCollectionListProps) => {
    return <BookmarkCollectionPage {...props} mode="manage" />;
};

export default Manage;
