import { useState } from "react";

export function useBookmark() {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    
    const handleOpenChange = (open: boolean) => {
        if (open && !isBookmarked) {
            setIsBookmarked(true);
            setIsOpen(true);
        } else {
            setIsOpen(open);
        }
    };

    const handleRemoveBookmark = () => {
        setIsBookmarked(false);
        setIsOpen(false);
    };

    return {
        isBookmarked,
        isOpen,
        handleOpenChange,
        handleRemoveBookmark
    };
}