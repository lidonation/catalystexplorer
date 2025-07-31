import React from 'react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Link } from '@inertiajs/react';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Button from '@/Components/atoms/Button';
import ThumbsDownIcon from '@/Components/svgs/ThumbsDownIcon';
import ThumbsUpIcon from '@/Components/svgs/ThumbsUpIcon';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import SecondaryLink from '@/Components/SecondaryLink.tsx';
import SecondaryButton from '@/Components/atoms/SecondaryButton.tsx';

interface SwipeCardProps {
    type: 'left' | 'right';
    bookmarkCollection: BookmarkCollectionData;
    swipeCount: number;
    onEditList: () => void;
    isDeleted: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
                                                 type,
                                                 bookmarkCollection,
                                                 swipeCount,
                                                 onEditList,
                                                 isDeleted
                                             }) => {
    const { t } = useLaravelReactI18n();

    if (isDeleted) {
        return null;
    }

    const isRightSwipe = type === 'right';
    const cardConfig = {
        title: isRightSwipe
            ? t('workflows.tinderProposal.step4.rightSwipes')
            : t('workflows.tinderProposal.step4.leftSwipes'),
        description: isRightSwipe
            ? t('workflows.tinderProposal.step4.proposalsYouLiked')
            : t('workflows.tinderProposal.step4.proposalsYouPassed'),
        badgeStyles: isRightSwipe
            ? 'bg-success-light px-3 py-1 rounded-sm text-sm font-medium border border-success/[20%] text-success'
            : 'bg-error-light/[60%] text-error/[70%] px-3 py-1 rounded-sm text-sm font-medium border border-error/[20%]',
        icon: isRightSwipe ? ThumbsUpIcon : ThumbsDownIcon,
        iconStyles: isRightSwipe ? 'text-success' : '',
        viewListStyles: isRightSwipe
            ? 'flex flex-1 flex-col items-center justify-center bg-success bg-success-light border border-success/[70%] hover:bg-success/[50%] font-semibold py-2 rounded transition'
            : 'flex flex-1 flex-col items-center justify-center bg-error-light/[70%] border border-error/[70%] hover:bg-error/[50%] py-2 rounded transition',
        viewListTextStyles: isRightSwipe ? 'text-success' : 'text-error'
    };

    const IconComponent = cardConfig.icon;

    return (
        <div
            className="rounded-lg p-6 bg-background border dark:border-2 border-border-dark-on-dark shadow-[0_4px_24px_0_rgba(0,0,0,0.10),0_0px_2px_0_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <Paragraph size="md" className="font-semibold">
                        {cardConfig.title}
                    </Paragraph>
                    <Paragraph size="sm" className="text-gray-persist">
                        {cardConfig.description}
                    </Paragraph>
                </div>
                <div className={`flex items-center ${cardConfig.badgeStyles}`}>
                    <div className="w-6 h-6 flex items-center justify-center">
                        <IconComponent
                            width={12}
                            height={12}
                            className={cardConfig.iconStyles}
                        />
                    </div>
                    {swipeCount} {t('workflows.tinderProposal.step4.saves')}
                </div>
            </div>
            <div className="flex flex-row w-full gap-4 mt-4">
                <SecondaryLink
                    className='flex-1 text-center'
                    href={generateLocalizedRoute('lists.manage', {
                        bookmarkCollection: bookmarkCollection.hash,
                        type: 'proposals'
                    })}
                    onClick={(e) => {
                        e.preventDefault();
                        window.open(generateLocalizedRoute('lists.manage', {
                            bookmarkCollection: bookmarkCollection.hash,
                            type: 'proposals'
                        }), '_blank', 'noopener,noreferrer');
                    }}
                >
                    <span className='block w-full'>
                        {t('bookmarks.manage')}
                    </span>
                </SecondaryLink>

                <SecondaryButton
                    className=' flex-1 text-center'
                    onClick={onEditList}
                >
                    <span className='block w-full'>
                        {t('bookmarks.listSetting')}
                    </span>
                </SecondaryButton>

            </div>
        </div>
    );
};

export default SwipeCard;
