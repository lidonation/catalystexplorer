// SelectionContext.tsx
import eventBus from '@/utils/eventBus';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import React, { createContext, useContext, useState } from 'react';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

type BookmarkStatus = 'saving' | 'removing' | 'saved' | 'removed';

type StatusMessage = {
    hash: string;
    type: BookmarkStatus;
    model: string;
};

type BookmarkContextType = {
    selectedItemsByType: Record<string, string[]>;
    toggleSelection: (model: string, hash: string) => void;
    bookmarkCollection: BookmarkCollectionData;
};

const BookmarkContext = createContext<BookmarkContextType | null>(null);

export const BookmarkProvider: React.FC<{
    preselected?: Record<string, string[]>;
    children: React.ReactNode;
    bookmarkCollection: BookmarkCollectionData;
}> = ({ preselected = {}, children, bookmarkCollection }) => {
    const [selectedItemsByType, setSelectedItemsByType] = useState(preselected);

    const toggleSelection = (model: string, hash: string) => {
        const selected = selectedItemsByType[model] || [];
        const isSelected = selected.includes(hash);
        const newSelection = isSelected
            ? selected.filter((h) => h !== hash)
            : [...selected, hash];

        setSelectedItemsByType((prev) => ({
            ...prev,
            [model]: newSelection,
        }));
        localStorage.setItem('bookmark_was_edited', 'true');

        const action: 'add' | 'remove' = isSelected ? 'remove' : 'add';

        const routeName =
            action === 'add'
                ? 'workflows.bookmarks.addBookmarkItem'
                : 'workflows.bookmarks.removeBookmarkItem';

        router.post(
            generateLocalizedRoute(routeName, {
                hash,
                modelType: model,
                bookmarkCollection: bookmarkCollection.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    action === 'add'
                        ? eventBus.emit('listIitem-added')
                        : eventBus.emit('listIitem-removed');
                },
            },
        );
    };

    return (
        <BookmarkContext.Provider
            value={{
                selectedItemsByType,
                toggleSelection,
                bookmarkCollection,
            }}
        >
            {children}
        </BookmarkContext.Provider>
    );
};

export const useBookmarkContext = () => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error(
            'useBookmarkContext must be used within a BookmarkProvider',
        );
    }
    return context;
};
