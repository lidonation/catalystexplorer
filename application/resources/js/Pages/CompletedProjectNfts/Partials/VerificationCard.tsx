import Paragraph from '@/Components/atoms/Paragraph'; // Added import for Paragraph component
import Title from '@/Components/atoms/Title';
import Check from '@/Components/svgs/Check';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface VerificationCardProps {
    verificationCode: string;
    onBack: () => void;
}

const VerificationCard: React.FC<VerificationCardProps> = ({
    verificationCode,
    onBack,
}) => {
    const { t } = useLaravelReactI18n();

    return (
        <>
            <button
                className="text-primary mb-4 flex cursor-pointer items-center text-sm font-medium"
                onClick={onBack}
            >
                {`< ${t('profileWorkflow.back')}`}
            </button>

            <Title level="2" className="text-center text-lg font-semibold">
                {t('profileWorkflow.verificationTitle')}
            </Title>
            <div className="mt-1 flex justify-center">
                <Check width={72} height={72} />
            </div>
            <div className="mt-4 text-center">
                <Paragraph>{t('profileWorkflow.verificationCode')}</Paragraph>
                <Paragraph className="text-primary text-2xl font-bold">
                    CODE$: {verificationCode}
                </Paragraph>
                <Paragraph className="mx-auto mt-4 w-3/4 text-center text-base">
                    {t('profileWorkflow.verificationInstructions')}
                </Paragraph>
                <a
                    href="https://ideascale.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary mt-4 inline-block w-3/4 rounded-lg px-4 py-2 text-white transition"
                >
                    {t('profileWorkflow.goToIdeascale')}
                </a>
            </div>
        </>
    );
};

export default VerificationCard;
