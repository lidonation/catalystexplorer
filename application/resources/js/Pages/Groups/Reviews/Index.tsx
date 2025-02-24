import { Head, WhenVisible } from '@inertiajs/react';
import GroupLayout from "../GroupLayout";
import ReviewData = App.DataTransferObjects.ReviewData;
import GroupData = App.DataTransferObjects.GroupData;
import { PaginatedData } from '../../../../types/paginated-data';
import AggregatedReviewsSummary from '@/Components/AggregatedReviewsSummary';

interface ReviewPageProps {
    reviews: PaginatedData<ReviewData[]>;
    group: GroupData;
}

export default function Reviews({ reviews, group }: ReviewPageProps) {
    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Connections`} />

            <WhenVisible data='reviews' fallback={<div>Loading Reviews</div>}>
                <div className='w-full overflow-auto'>
                    <div>
                        <AggregatedReviewsSummary reviews={reviews?.data ?? []} />
                    </div>

                    {typeof reviews?.data !== 'undefined' && (
                        <div className='max-w-full lg:max-w-lg'>
                            {JSON.stringify(reviews?.data)}
                        </div>
                    )}
                </div>
            </WhenVisible>
        </GroupLayout>
    );
}
