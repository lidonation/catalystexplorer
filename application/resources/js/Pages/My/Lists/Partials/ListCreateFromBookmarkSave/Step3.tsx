import ArrowLeftIcon from '@/Components/svgs/ArrowLeft';
import { useList } from '@/Context/ListContext';
import { TransitionListPageProps } from '../../../../../../types/general';

const BookmarkPage3 = ({ onNavigate }: TransitionListPageProps) => {
    const { latestAddedList } = useList();

    if (!latestAddedList) {
        return null;
    }
    
    return (
        <div className="space-y-2">
            <div className="bg-primary-light">
                <button
                    onClick={() => onNavigate?.(0)}
                    className="flex items-center gap-2 px-3 py-2 font-bold text-content"
                >
                    <ArrowLeftIcon />
                    <p>Success</p>
                </button>
            </div>
            <section className="flex flex-col items-center justify-center gap-1 px-3">
                <p className="text-sm font-light italic">
                    Successfully created
                </p>
                <p className="font-semibold">"{latestAddedList.name}"</p>
            </section>
        </div>
    );
};
export default BookmarkPage3;
