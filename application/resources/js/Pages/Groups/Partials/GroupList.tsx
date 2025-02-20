import React from 'react';
import GroupData = App.DataTransferObjects.GroupData;
import GroupCard from "@/Pages/Groups/Partials/GroupCard";
import GroupCardMini from "@/Pages/Groups/Partials/GroupCardMini";
import GroupCardExtended from "@/Pages/Groups/Partials/GroupCardExtended";
import {AnimatePresence, motion} from "framer-motion";

interface GroupListProps {
    groups: GroupData[];
}

const GroupList: React.FC<GroupListProps> = ({
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
                            <GroupCard group={group}/>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </>
    );
};

export default GroupList;
