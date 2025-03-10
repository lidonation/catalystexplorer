import React, { useEffect } from 'react';
import GroupData = App.DataTransferObjects.GroupData;
import GroupCardExtended from "@/Pages/Groups/Partials/GroupCardExtended";
import {AnimatePresence, motion} from "framer-motion";
import GroupHeroSection from '@/Pages/Groups/Partials/GroupHeroSection';

interface GroupListProps {
    groups: GroupData[];
  
}

const GroupsList: React.FC<GroupListProps> = ({
                                                 groups,
                                             }) => {
    return (
        <>
            <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {groups?.map((group, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeIn' }}
                        >
                            <GroupCardExtended group={group}>
                                <button className="btn btn-success">
                                    Manage Group
                                </button>
                            </GroupCardExtended>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </>
    );
};

export default GroupsList;