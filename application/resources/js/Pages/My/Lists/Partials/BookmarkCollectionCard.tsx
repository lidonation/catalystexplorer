import Card from '@/Components/Card';
import UserAvatar from '@/Components/UserAvatar';
import Button from '@/Components/atoms/Button';
import Title from '@/Components/atoms/Title';
import capitalizeFirstLetter from '@/utils/caps';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { formatTimestamp } from '@/utils/timeStamp';
import { Link, usePage } from '@inertiajs/react';
import { Clock, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Paragraph from '@/Components/atoms/Paragraph';

const BookmarkCollectionCard = ({
    collection,
}: {
    collection: BookmarkCollectionData;
}) => {
    const { t } = useTranslation();
    const { auth } = usePage().props;

    const user = collection?.author;

    const isAuthor = auth?.user.hash == user?.hash;

    const color = `bg-[${collection.color}]`;
    return (
        <Card className="relative flex w-full gap-1 lg:gap-3">
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
            {user && (
                <div className="">
                    <div className="flex items-center py-2 lg:gap-6">
                        <div className="flex items-center gap-2">
                            <UserAvatar
                                size="size-8"
                                imageUrl={user.hero_img_url}
                            />

                            <span className="lg:text-md text-xs font-semibold">
                                {user.name}
                            </span>
                        </div>

                        {collection?.updated_at && (
                            <div className="text-muted-foreground lg:text-md flex items-center gap-2 text-xs">
                                <Clock className="h-5 w-5" />
                                <span className="font-semibold">
                                    Last Modified:{' '}
                                </span>
                                <span>
                                    {formatTimestamp(collection?.updated_at)}
                                </span>
                            </div>
                        )}

                        <div className="text-muted-foreground lg:text-md flex items-center gap-2 text-xs">
                            <MessageCircle className="h-5 w-5" />
                            <span className="font-semibold">Comments: </span>
                            <span>{collection.comments_count}</span>
                        </div>
                    </div>
                </div>
            )}
            {/* <div className="py-6"> */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                {Object.entries(collection?.types_count ?? {})?.map((item) => {
                    let pluralizedModel = capitalizeFirstLetter(item[0]);
                    return (
                        <div className="space-y-1">
                            <p className="text-4xl font-bold">{item[1]}</p>
                            <p className="text-muted-foreground">
                                {pluralizedModel}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="top-4 right-4 lg:absolute">
                {isAuthor ? (
                    <Link
                        href={useLocalizedRoute('my.lists.show', {
                            list: collection?.hash,
                        })}
                    >
                        <Button className="bg-success w-full px-4 py-1.5 font-medium text-white">
                            {t('my.manage')}
                        </Button>
                    </Link>
                ) : (
                    <PrimaryButton className="bg-success w-full px-4 hover:bg-green-600">
                        View List
                    </PrimaryButton>
                )}
            </div>

            <div
                className={`absolute bottom-0 left-0 lg:h-2 h-1 w-full rounded-b-lg`}
                style={{ backgroundColor: collection.color }}
            ></div>
        </Card>
    );
};

export default BookmarkCollectionCard;
