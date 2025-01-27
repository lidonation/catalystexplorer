import { useBookmark } from '@/Hooks/useBookmark';
import BookmarkPage1 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step1';
import BookmarkPage2 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step3';
import TransitionMenu from '@/Pages/My/Lists/Partials/TransitionMenu';
import { type ReactNode } from 'react';

interface ListQuickCreateProps {
    children: ReactNode;
}
export default function ListQuickCreate({ children }: ListQuickCreateProps) {
    const { isBookmarked, isOpen, handleOpenChange, handleRemoveBookmark } = useBookmark();
    
    const pages = [
        <BookmarkPage1
            key="main"
            isBookmarked={isBookmarked}
            handleRemoveBookmark={handleRemoveBookmark}
        />,
        <BookmarkPage2 key="priority" />,
        <BookmarkPage3 key="new-list" />,
    ];

    return (
        <TransitionMenu
            trigger={children}
            pages={pages}
            side="left"
            align="start"
            alignOffset={40}
            width="240px"
            open={isOpen}
            onOpenChange={handleOpenChange}
        />
    );
}