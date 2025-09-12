import Paragraph from '@/Components/atoms/Paragraph';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import UserData = App.DataTransferObjects.UserData;
import BookmarkCollectionData = App.DataTransferObjects.BookmarkCollectionData;
import PrimaryLink from '@/Components/atoms/PrimaryLink';

interface VotingListTableProps {
    votingList: BookmarkCollectionData[];
}

export default function VotingListTable({ votingList }: VotingListTableProps) {
    const { t } = useLaravelReactI18n();

    const [copySuccess, setCopySuccess] = useState<Record<number, boolean>>(
        Object.fromEntries(votingList.map((_, index) => [index, false])),
    );

    const tableColumns = [
        { label: t('dreps.votingList') },
        { label: t('dreps.view') },
    ];

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                setCopySuccess((prev) => ({ ...prev, [index]: true }));

                setTimeout(() => {
                    setCopySuccess((prev) => {
                        const newState = { ...prev };
                        delete newState[index];
                        return newState;
                    });
                }, 2000);
            })
            .catch((err) => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="w-full overflow-x-auto overflow-y-auto rounded-t-lg shadow-md">
            <table className="w-full">
                <thead>
                    <tr className="bg-background-lighter border-dark/30 border-b">
                        {tableColumns.map((column, index) => (
                            <th
                                key={index}
                                className={`text-gray-persist border-dark/30 px-4 py-2 text-left ${
                                    index === tableColumns.length - 1
                                        ? ''
                                        : 'border-r'
                                }`}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {votingList.map((item, index) => (
                        <tr key={index} className="border-dark/30 border-b">
                            <td className="text-gray-persist flex items-center gap-2 px-4 py-8">
                                <Paragraph>{item?.title}</Paragraph>
                            </td>

                            <td className="border-dark/30 border px-4 py-2">
                                <PrimaryLink
                                    href={useLocalizedRoute('lists.view', {
                                        bookmarkCollection: item?.id,
                                        type: 'proposals',
                                    })}
                                >
                                    {t('dreps.view')}
                                </PrimaryLink>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
