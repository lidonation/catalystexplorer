import Paragraph from '@/Components/atoms/Paragraph';
import ArrowLeftIcon from '@/Components/svgs/ArrowLeft';
import { useList } from '@/Context/ListContext';
import { useTranslation } from 'react-i18next';
import { TransitionListPageProps } from '../../../../../types/general';

const BookmarkPage3 = ({ onNavigate }: TransitionListPageProps) => {
    const { t } = useTranslation();
    const { latestAddedList } = useList();

    if (!latestAddedList) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="bg-primary-light">
                <button
                    onClick={() => onNavigate?.(0)}
                    className="text-content flex items-center gap-2 px-3 py-2 font-bold"
                >
                    <ArrowLeftIcon />
                    <Paragraph size="md">
                        {t('listQuickCreate.success.title')}
                    </Paragraph>
                </button>
            </div>
            <section className="flex flex-col items-center justify-center gap-1 px-3">
                <Paragraph size="sm" className="font-light italic">
                    {t('listQuickCreate.success.message')}
                </Paragraph>
                <Paragraph size="md" className="font-semibold">
                    "{latestAddedList.title}"
                </Paragraph>
            </section>
        </div>
    );
};

export default BookmarkPage3;
