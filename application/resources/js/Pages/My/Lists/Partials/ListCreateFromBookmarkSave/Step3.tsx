import Paragraph from '@/Components/atoms/Paragraph';
import ArrowLeftIcon from '@/Components/svgs/ArrowLeft';
import { useList } from '@/Context/ListContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { TransitionListPageProps } from '../../../../../types/general';

const BookmarkPage3 = ({ onNavigate }: TransitionListPageProps) => {
    const { t } = useLaravelReactI18n();
    const { latestAddedList } = useList();

    if (!latestAddedList) {
        return null;
    }

    return (
        <div className="space-y-2" data-testid="bookmark-page3">
            <div className="bg-primary-light">
                <button
                    onClick={() => onNavigate?.(0)}
                    className="text-content flex items-center gap-2 px-3 py-2 font-bold"
                    data-testid="success-back-button"
                >
                    <ArrowLeftIcon />
                    <Paragraph size="md">
                        {t('listQuickCreate.success.title')}
                    </Paragraph>
                </button>
            </div>
            <section className="flex flex-col items-center justify-center gap-1 px-3" data-testid="success-message-section">
                <Paragraph size="sm" className="font-light italic">
                    {t('listQuickCreate.success.message')}
                </Paragraph>
                <Paragraph size="md" className="font-semibold" data-testid="created-list-title">
                    "{latestAddedList.title}"
                </Paragraph>
            </section>
        </div>
    );
};

export default BookmarkPage3;
