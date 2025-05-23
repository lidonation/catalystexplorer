// SelectionContext.tsx
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import React, { createContext, useContext, useState } from 'react';

type BookmarkStatus = 'saving' | 'removing' | 'saved' | 'removed';

type StatusMessage = {
    hash: string;
    type: BookmarkStatus;
    model: string;
};

type BookmarkContextType = {
    selectedItemsByType: Record<string, string[]>;
    toggleSelection: (model: string, hash: string) => void;
    statusMessages: StatusMessage[];
    progress: { total: number; completed: number };
};

const BookmarkContext = createContext<BookmarkContextType | null>(null);

export const BookmarkProvider: React.FC<{
    preselected?: Record<string, string[]>;
    children: React.ReactNode;
    bookmarkCollection: string;
}> = ({ preselected = {}, children, bookmarkCollection }) => {
    const [selectedItemsByType, setSelectedItemsByType] = useState(preselected);
    const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
    const [progress, setProgress] = useState({ total: 0, completed: 0 });
    

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

        const action: 'add' | 'remove' = isSelected ? 'remove' : 'add';
        const status: BookmarkStatus = isSelected ? 'removing' : 'saving';
        const finalStatus: BookmarkStatus = isSelected ? 'removed' : 'saved';

        setStatusMessages((msgs) => [...msgs, { model, hash, type: status }]);
        setProgress((p) => ({ total: p.total + 1, completed: p.completed }));

        const routeName =
            action === 'add'
                ? 'workflows.bookmarks.addBookmarkItem'
                : 'workflows.bookmarks.removeBookmarkItem';

        router.post(
            generateLocalizedRoute(routeName, {
                hash,
                modelType: model,
                bookmarkCollection,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setStatusMessages((msgs) => [
                        ...msgs,
                        { model, hash, type: finalStatus },
                    ]);
                    setTimeout(() => {
                        setStatusMessages((msgs) =>
                            msgs.filter(
                                (m) =>
                                    m.hash !== hash ||
                                    m.type === 'saving' ||
                                    m.type === 'removing',
                            ),
                        );
                    }, 3000);
                },
                onFinish: () => {
                    setProgress((p) => ({
                        total: p.total,
                        completed: p.completed + 1,
                    }));
                },
            },
        );
    };

    return (
        <BookmarkContext.Provider
            value={{
                selectedItemsByType,
                toggleSelection,
                statusMessages,
                progress,
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
