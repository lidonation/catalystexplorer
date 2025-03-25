import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { PaginatedData } from '../../../../types/paginated-data';
import CommunityCard from './CommunityCard';
import CommunityData = App.DataTransferObjects.CommunityData;

interface CommunitesProps {
    communities: PaginatedData<CommunityData[]>;
}

const CommunitiesList: React.FC<CommunitesProps> = ({ communities }) => {
    if (!communities.data?.length) {
        return (
            <div className="w-full">
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeIn' }}
                    >
                        <RecordsNotFound context="communities" searchTerm="" />
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {communities.data &&
                communities.data?.map((community) => (
                    <CommunityCard key={community.hash} community={community} />
                ))}
        </div>
    );
};

export default CommunitiesList;
