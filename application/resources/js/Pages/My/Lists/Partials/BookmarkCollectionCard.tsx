import Card from '@/Components/Card';
import UserAvatar from '@/Components/UserAvatar';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import capitalizeFirstLetter from '@/utils/caps';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { formatTimestamp } from '@/utils/timeStamp';
import { usePage } from '@inertiajs/react';
import { Clock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

const BookmarkCollectionCard = ({
    collection,
}: {
    collection: BookmarkCollectionData;
}) => {
    const { t } = useTranslation();
    const { auth } = usePage().props;

    const user = collection?.author;

    const isAuthor = auth?.user?.hash == user?.hash;
    return (
        <Card
            className="relative flex w-full gap-1 lg:gap-3"
            key={collection.hash}
        >
            <div className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Title level="4" className="font-bold lg:text-2xl">
                            {collection.title}
                        </Title>
                        <div className="bg-primary-light text-primary border-primary rounded-lg border px-2 py-1 text-sm text-nowrap lg:px-4">
                            {`${collection?.items_count} ${t('my.items')}`}
                        </div>
                    </div>
                    <Paragraph
                        size="sm"
                        className="text-muted-foreground lg:text-md lg:w-5/6"
                    >
                        {collection?.content || 'No description available.'}
                    </Paragraph>
                </div>
            </div>

            <div className="">
                <div className="flex items-center gap-4 py-2 lg:gap-6">
                    <div className="flex items-center gap-2">
                        <UserAvatar
                            size="size-8"
                            imageUrl={
                                user?.hero_img_url
                                    ? user?.hero_img_url
                                    : undefined
                            }
                            name={user?.name}
                        />

                        <span className="lg:text-md text-xs font-semibold">
                            {user?.name}
                        </span>
                    </div>

                    {collection?.updated_at && (
                        <div className="text-muted-foreground lg:text-md flex items-center gap-2 text-xs">
                            <Clock className="hidden h-5 w-5 lg:block" />
                            <span className="font-semibold">
                                {t('bookmarks.lastModified')}:{' '}
                            </span>
                            <span>
                                {formatTimestamp(collection?.updated_at)}
                            </span>
                        </div>
                    )}

                    <div className="text-muted-foreground lg:text-md flex items-center gap-2 text-xs">
                        <MessageCircle className="hidden h-5 w-5 lg:block" />
                        <span className="font-semibold">
                            {t('bookmarks.comments')}:{' '}
                        </span>
                        <span>{collection.comments_count ?? 0}</span>
                    </div>
                </div>
            </div>

            {/* <div className="py-6"> */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                {Object.entries(collection?.types_count ?? {})?.map((item) => {
                    let pluralizedModel = capitalizeFirstLetter(item[0]);
                    return (
                        <div className="space-y-1" key={`${pluralizedModel}`}>
                            <p className="text-4xl font-bold">{item[1]}</p>
                            <p className="text-muted-foreground">
                                {pluralizedModel}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="top-4 right-4 lg:absolute">
                {user?.hash && isAuthor ? (
                    <div className="flex flex-col gap-2 lg:flex-row lg:gap-3">
                        <PrimaryLink
                            className="bg-success w-full px-4 py-1.5 font-medium text-white lg:w-auto lg:whitespace-nowrap"
                            href={useLocalizedRoute('lists.manage', {
                                bookmarkCollection: collection?.hash,
                                type: 'proposals',
                            })}
                        >
                            {t('my.manage')}
                        </PrimaryLink>
                        <PrimaryLink
                            href={useLocalizedRoute('lists.view', {
                                bookmarkCollection: collection?.hash,
                            })}
                            className="bg-success w-full px-4 py-1.5 hover:bg-green-600 lg:w-auto lg:whitespace-nowrap"
                        >
                            {t('View List')}
                        </PrimaryLink>
                    </div>
                ) : (
                    <PrimaryLink
                        href={useLocalizedRoute('lists.view', {
                            bookmarkCollection: collection?.hash,
                        })}
                        className="bg-success w-full px-4 hover:bg-green-600"
                    >
                        {t('View List')}
                    </PrimaryLink>
                )}
            </div>

            <div
                className={`absolute bottom-0 left-0 h-1 w-full rounded-b-lg lg:h-1.5`}
                style={{ backgroundColor: collection.color }}
            ></div>
        </Card>
    );
};

export default BookmarkCollectionCard;
