import RecordsNotFound from '@/Layouts/RecordsNotFound';
import {AnimatePresence, motion} from 'framer-motion';
import React from 'react';
import {PaginatedData} from '../../../../types/paginated-data';
import CommunityCard from './CommunityCard';
import CommunityData = App.DataTransferObjects.CommunityData;

interface CommunitiesProps {
    communities: PaginatedData<CommunityData[]>;
}

const CommunitiesList: React.FC<CommunitiesProps> = ({communities}) => {
    return (<div>
        <AnimatePresence>
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                transition={{duration: 0.4, ease: 'easeIn'}}
            >
                {!communities.data?.length ? (
                    <div className="w-full">
                        <RecordsNotFound context="communities" searchTerm=""/>
                    </div>
                ) : (
                    <div className="grid w-full grid-cols-1 gap-4 grid-cols-2 xl:grid-cols-3">
                        {communities.data &&
                            communities.data?.map((community) => (
                                <CommunityCard key={community.hash} community={community}/>
                            ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    </div>)
};

export default CommunitiesList;
