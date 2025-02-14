import ArrowLeftIcon from '@/Components/svgs/ArrowLeft';
import { useList } from '@/Context/ListContext';
import { TransitionListPageProps } from '../../../../../../types/general';
import Paragraph from '@/Components/atoms/Paragraph';

const BookmarkPage3 = ({ onNavigate }: TransitionListPageProps) => {
    const { latestAddedList } = useList();

    if (!latestAddedList) {
        return null;
    }
    
    return (
        <div className=" space-y-2">
            <div className="bg-primary-light">
                <button
                    onClick={() => onNavigate?.(0)}
                    className="flex items-center gap-2 px-3 py-2 font-bold text-content"
                >
                    <ArrowLeftIcon />
                    <Paragraph>Success</Paragraph>
                </button>
            </div>
            <section className="flex flex-col items-center justify-center gap-1 px-3">
                <Paragraph className="text-sm font-light italic">
                    Successfully created
                </Paragraph>
                <Paragraph className="font-semibold">"{latestAddedList.name}"</Paragraph>
            </section>
        </div>
    );
};
export default BookmarkPage3;