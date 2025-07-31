import Button from '@/Components/atoms/Button';
import { ListProvider } from '@/Context/ListContext';
import BookmarkPage2 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step2';
import BookmarkPage3 from '@/Pages/My/Lists/Partials/ListCreateFromBookmarkSave/Step3';
import TransitionMenu from '@/Pages/My/Lists/Partials/TransitionMenu';
import { useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface CreateListButtonProps {
    variant?: 'default' | 'large';
    className?: string;
}
export default function CreateListButton({
    variant = 'default',
    className,
}: CreateListButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
    };

    const { t } = useLaravelReactI18n();

    const pages = [
        <ListProvider key="provider-main">
            <BookmarkPage2 key="main" />
        </ListProvider>,
        <ListProvider key="provider-new-list">
            <BookmarkPage3 key="new-list" />
        </ListProvider>,
    ];

    const buttonClasses =
        variant === 'large'
            ? 'bg-primary px-6 py-4 text-lg text-white ' + (className || '')
            : 'bg-primary px-4 py-2 text-sm text-white ' + (className || '');

    return (
        <TransitionMenu
            trigger={
                <Button
                    className={buttonClasses}
                    onClick={() => setIsOpen(true)}
                >
                    {`+ ${t('my.createList')}`}
                </Button>
            }
            pages={pages}
            open={isOpen}
            onOpenChange={handleOpenChange}
            side="bottom"
            align="center"
            width="240px"
        />
    );
}
