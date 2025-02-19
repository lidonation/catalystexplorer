import React from 'react';
import CommunitData = App.DataTransferObjects.CommunityData;
import {AnimatePresence, motion} from "framer-motion";
import CommunityCard from './CommunityCard';

interface CommunityListProps {
    communities: CommunitData[];
}

const CommunityList: React.FC<CommunityListProps> = ({
                                                 communities,
                                             }) => {
    return (
        <>
            <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {communities?.map((community, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeIn' }}
                        >
                            <CommunityCard community={community}/>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </>
    );
};

export default CommunityList;
