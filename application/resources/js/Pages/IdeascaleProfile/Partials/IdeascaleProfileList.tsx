import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IdeascaleProfileCardMini from './IdeascaleProfileCardMini';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfilesListProps {
    ideascaleProfiles: IdeascaleProfileData[];
}

const IdeascaleProfilesList: React.FC<IdeascaleProfilesListProps> = ({
    ideascaleProfiles,
}) => {
    if (!ideascaleProfiles?.length) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeIn' }}
            >
                <RecordsNotFound
                    context="profiles"
                    searchTerm=""
                />
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {ideascaleProfiles.map((ideascaleProfile, index) => (
                    <motion.li
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, ease: 'easeIn' }}
                        className='h-full'
                    >
                        <IdeascaleProfileCardMini
                            ideascaleProfile={ideascaleProfile}
                        />
                    </motion.li>
                ))}
            </ul>
        </AnimatePresence>
    );
};

export default IdeascaleProfilesList;
