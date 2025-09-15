import Card from '@/Components/Card';
import UserAvatar from '@/Components/UserAvatar';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import capitalizeFirstLetter from '@/utils/caps';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { formatTimestamp } from '@/utils/timeStamp';
import { Link, router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Clock, MessageCircle } from 'lucide-react';
import DropdownMenu, {
    DropdownMenuItem,
} from '../../../Bookmarks/Partials/DropdownMenu';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import { truncateMiddle } from '@/utils/truncateMiddle.ts';
import { useWorkflowUrl } from '@/utils/workflowUrls';
import ListTypeResearchIconProps from '@/Components/svgs/ListTypeResearchIcon.tsx';
import ListTypeVoterIcon from '@/Components/svgs/ListTypeVoterIcon.tsx';

const BookmarkCollectionCard = ({
    collection,
}: {
    collection: BookmarkCollectionData;
}) => {
    const { t } = useLaravelReactI18n();
    const { auth } = usePage().props;

    const user = collection?.author;

    const isAuthor = auth?.user?.id == user?.id;

    const renderListTypeIcon = () => {
        switch (collection?.list_type) {
            case 'normal':
                return (
                    <div className='flex gap-2 flex-nowrap items-center'>
                        <ListTypeResearchIconProps />
                        <span>{t('bookmarks.researchList')}</span>
                    </div>
                );
            case 'voter':
                return (
                    <div className='flex gap-2 flex-nowrap items-center'>
                        <ListTypeVoterIcon />
                        <span>{t('bookmarks.voterList')} ({`${collection?.items_count} ${t('proposals.proposals')}`})</span>
                    </div>
                );
            default:
                return (
                    <div className='flex gap-2 flex-nowrap items-center'>
                        <ListTypeResearchIconProps />
                        <span>{t('bookmarks.researchList')}</span>
                    </div>
                );
        }
    };

    const viewListRoute = useLocalizedRoute('lists.view', {
        bookmarkCollection: collection?.id,
    });

    const manageListRoute = useLocalizedRoute('my.lists.manage', {
        bookmarkCollection: collection?.id,
        type: 'proposals',
    });


    const dropdownMenuItems: DropdownMenuItem[] = [
        {
            label: t('workflows.bookmarks.viewList'),
            type: 'button',
            onClick: () => {
                router.visit(viewListRoute);
            },
        },
        {
            label: t('bookmarks.editListItem'),
            type: 'link' as const,
            href: useWorkflowUrl(collection)
        },
        {
            label: t('my.manage'),
            type: 'button' as const,
            onClick: () => {
                router.visit(manageListRoute);
            },
            disabled: !isAuthor,
        },

    ];
    return (
        <Card
            className="relative flex w-full gap-1 lg:gap-3"
            key={collection.id}
            data-testid="bookmark-collection-card"
            data-collection-hash={collection.id}
        >
            <div className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Link
                            href={useLocalizedRoute('lists.view', {
                                bookmarkCollection: collection?.id,
                                type: 'proposals',
                            })}
                        >
                            <Title
                                level="4"
                                className="hover:text-primary cursor-pointer font-bold transition-colors lg:text-2xl"
                            >
                                {collection.title}
                            </Title>
                        </Link>
                        <div className="bg-primary-light text-primary border-primary rounded-full  border pr-2 text-sm text-nowrap lg:pr-4">
                            {renderListTypeIcon()}
                        </div>
                    </div>
                    <Paragraph
                        size="sm"
                        className="text-muted-foreground lg:text-md w-1/2 break-words whitespace-normal lg:w-5/6"
                    >
                        {collection?.content || 'No description available.'}
                    </Paragraph>
                </div>
            </div>

            <div className="">
                <div className="flex items-center gap-4 py-2 lg:gap-6">
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            data-testid="user-avatar"
                            size="size-8"
                            imageUrl={
                                user?.hero_img_url
                                    ? user?.hero_img_url
                                    : undefined
                            }
                            name={user?.name ?? 'Anonymous'}
                        />

                        <Paragraph className="lg:text-md text-xs font-semibold">
                            {truncateMiddle(user?.name || '', 32)}
                        </Paragraph>
                    </div>

                    {collection?.updated_at && (
                        <div
                            className="text-muted-foreground lg:text-md flex items-center gap-2 text-xs"
                            data-testid="last-modified"
                        >
                            <Clock className="hidden h-5 w-5 lg:block" />
                            <Paragraph className="font-semibold">
                                {t('bookmarks.lastModified')}:{' '}
                            </Paragraph>
                            <Paragraph>
                                {formatTimestamp(collection?.updated_at)}
                            </Paragraph>
                        </div>
                    )}

                    <div
                        className="text-muted-foreground lg:text-md flex items-center gap-2 text-xs"
                        data-testid="comments-count"
                    >
                        <MessageCircle className="hidden h-5 w-5 lg:block" />
                        <Paragraph className="font-semibold">
                            {t('bookmarks.comments')}:{' '}
                        </Paragraph>
                        <Paragraph>{collection.comments_count ?? 0}</Paragraph>
                    </div>
                </div>
            </div>

            {collection?.list_type !== 'voter' && <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                {Object.entries(collection?.types_count ?? {})?.map((item) => {
                    const pluralizedModel = capitalizeFirstLetter(item[0]);
                    return (
                        <div className="space-y-1" key={`${pluralizedModel}`}>
                            <Paragraph className="text-4xl font-bold">{item[1]}</Paragraph>
                            <Paragraph className="text-muted-foreground">
                                {pluralizedModel}
                            </Paragraph>
                        </div>
                    );
                })}
            </div>}

            <div className="absolute top-4 right-4">
                <DropdownMenu items={dropdownMenuItems} useSimpleTrigger={true} />
            </div>

            <div
                className={`absolute bottom-0 left-0 h-1 w-full rounded-b-lg lg:h-1.5`}
                style={{ backgroundColor: collection.color }}
            ></div>
        </Card>
    );
};

export default BookmarkCollectionCard;
