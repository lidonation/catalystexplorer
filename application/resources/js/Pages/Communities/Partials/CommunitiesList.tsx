import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import CommunityCard from './CommunityCard';
import CommunityData = App.DataTransferObjects.CommunityData;

interface CommunitiesProps {
    communities: PaginatedData<CommunityData[]>;
}

const CommunitiesList: React.FC<CommunitiesProps> = ({ communities }) => {
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
                    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {communities?.data &&
                            communities.data?.map((community) => (
                                <CommunityCard
                                    key={community.hash}
                                    community={community}
                                />
                            ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default CommunitiesList;
