import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import CommunityCard from './CommunityCard';
import CommunityData = App.DataTransferObjects.CommunityData;
import CommunityCardMini from './CommunityCardMini';

interface CommunitiesListProps {
    communities: PaginatedData<CommunityData[]>;
    cardType?: 'full' | 'mini';
    gridCols?: string;
}

const CommunitiesList: React.FC<CommunitiesListProps> = ({ 
    communities, 
    cardType = 'mini',
    gridCols = 'grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4'
}) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeIn' }}
            >
                {!communities?.data?.length ? (
                    <RecordsNotFound context="communities" searchTerm="" />
                ) : (
                    <div className={`grid w-full ${gridCols}`}>
                        {communities?.data &&
                            communities.data?.map((community) => (
                                cardType === 'full' ? (
                                    <CommunityCard
                                        key={community.hash}
                                        community={community}
                                    />
                                ) : (
                                    <CommunityCardMini
                                        key={community.hash}
                                        community={community}
                                    />
                                )
                            ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default CommunitiesList;
