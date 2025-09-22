import Paragraph from '@/Components/atoms/Paragraph';
import { shortNumber } from '@/utils/shortNumber';

interface VideoStatsComponentProps {
    icon: React.ReactNode;
    count: string | number;
}

export default function VideoStatsComponent({
    icon,
    count,
}: VideoStatsComponentProps) {
    return (
        <div className="flex items-center space-x-2">
            <div className="flex w-fit items-center justify-center gap-1 rounded-md p-3 font-bold shadow-sm">
                <div className="flex-shrink-0">{icon}</div>
                <Paragraph
                    size="sm"
                    className="m-0 flex items-center leading-none"
                >
                    {count}
                </Paragraph>
            </div>
        </div>
    );
}
