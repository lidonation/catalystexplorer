import GroupCard from '@/Pages/Groups/Partials/GroupCard';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import GroupData = App.DataTransferObjects.GroupData;
import GroupCardMini from './GroupCardMini';

interface GroupListProps {
    groups: GroupData[];
    cardType?: 'full' | 'mini';
    gridCols?: string;
}

const GroupList: React.FC<GroupListProps> = ({ 
    groups, 
    cardType = 'mini',
    gridCols = 'grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr'
}) => {
    return (
        <>
            <ul className={`grid w-full ${gridCols}`}>
                <AnimatePresence>
                    {groups?.map((group, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeIn' }}
                            className="h-full flex"
                        >
                            {cardType === 'full' ? (
                                <div className="w-full flex-1">
                                    <GroupCard group={group} />
                                </div>
                            ) : (
                                <GroupCardMini group={group} />
                            )}
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </>
    );
};

export default GroupList;