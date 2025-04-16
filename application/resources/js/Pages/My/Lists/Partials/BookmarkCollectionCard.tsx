import Card from '@/Components/Card';
import Button from '@/Components/atoms/Button';
import KeyValue from '@/Components/atoms/KeyValue';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;

const BookmarkCollectionCard = ({
    collection,
}: {
    collection: BookmarkCollectionData;
}) => {
    const { t } = useTranslation();
    return (
        <Card>
            <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Title level="4">{collection.title}</Title>
                        <div className="bg-primary inline-block rounded-md px-3 py-1 text-sm text-white">
                            {`${collection?.items_count} ${t('my.items')}`}
                        </div>
                    </div>
                    <Link
                        href={useLocalizedRoute('my.lists.show', {
                            list: collection?.hash,
                        })}
                    >
                        <Button className="bg-success px-4 py-1.5 font-medium text-white">
                            {t('my.manage')}
                        </Button>
                    </Link>
                </div>

                <Paragraph className="mb-4 text-sm text-gray-600">
                    {collection?.content || 'No description available.'}
                </Paragraph>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                    {collection?.type_counts?.map((item, index) => {
                        const count = item?.count ?? 0;
                        const model = item?.model ?? '';

                        // Handle pluralization
                        let pluralizedModel = model;
                        if (count !== 1) {
                            pluralizedModel =
                                model === 'Community'
                                    ? 'Communities'
                                    : model + 's';
                        }

                        return (
                            <KeyValue
                                key={index}
                                valueKey={pluralizedModel}
                                value={count}
                            />
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export default BookmarkCollectionCard;
