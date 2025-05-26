import GroupCard from '@/Pages/Groups/Partials/GroupCard';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import BookmarkCollectionCard from './BookmarkCollectionCard';

interface BookmarkCollectionListProps {
    bookmarkCollections: BookmarkCollectionData[];
}

const BookmarkCollectionList: React.FC<BookmarkCollectionListProps> = ({ bookmarkCollections }) => {
    return (
        <>
            <ul className="grid w-full grid-cols-1 gap-4">
                <AnimatePresence>
                    {bookmarkCollections?.map((bookmarkCollection, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeIn' }}
                            className="h-full"
                        >
                            <BookmarkCollectionCard
                                collection={bookmarkCollection}
                            />
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </>
    );
};

export default BookmarkCollectionList;
