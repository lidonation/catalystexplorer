import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { ErrorBadge } from '@/Components/svgs/ErrorBadge';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface ErrorComponentProps {
    errorMessage: string;
}
export default function ErrorComponent({
    errorMessage,
}: ErrorComponentProps) {
    const { t } = useLaravelReactI18n();
    return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded p-8 md:w-3/4 md:shadow-sm">
            <Title level="4" className="mx-4 mb-4 text-center font-bold">
                {t('workflows.claimCatalystProfile.error')}
            </Title>
            <ErrorBadge size={80} />
            <Paragraph size="md" className="text-gray-persist mt-4 text-center">
                {errorMessage}
            </Paragraph>
        </div>
    );
}
