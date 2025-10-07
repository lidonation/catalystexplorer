import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { cn } from '@/lib/utils';

type ComingSoonMessageProps = {
    context: string;
    className?: string;
};

const ComingSoonMessage: React.FC<ComingSoonMessageProps> = ({ context, className }) => {
    const { t } = useLaravelReactI18n();

    return (
        <div
            className={cn(
                'flex h-64 flex-col items-center justify-center gap-4 text-center',
                className,
            )}
        >
            <Title level="3" className="text-2xl font-semibold text-darker">
                {t('charts.comingSoonTitle', { context })}
            </Title>
        </div>
    );
};

export default ComingSoonMessage;
