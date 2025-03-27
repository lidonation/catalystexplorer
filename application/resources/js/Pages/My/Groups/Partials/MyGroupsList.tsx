import GroupCardExtended from '@/Pages/Groups/Partials/GroupCardExtended';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupData = App.DataTransferObjects.GroupData;
import Button from '@/Components/atoms/Button';

interface GroupListProps {
    groups: GroupData[];
}

const GroupsList: React.FC<GroupListProps> = ({ groups }) => {
    const { t } = useTranslation();
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
                                <Button className="bg-success absolute top-2 right-2 rounded px-3 py-1 text-white">
                                    {t('groups.manageGroup')}
                                </Button>
                            </GroupCardExtended>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </>
    );
};

export default GroupsList;
