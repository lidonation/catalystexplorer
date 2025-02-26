import { useTranslation } from "react-i18next";
import Check from "@/Components/svgs/Check";
import Title from "@/Components/atoms/Title";
import Paragraph from "@/Components/atoms/Paragraph"; // Added import for Paragraph component

interface VerificationCardProps {
    verificationCode: string;
    onBack: () => void;
}

const VerificationCard: React.FC<VerificationCardProps> = ({ verificationCode, onBack }) => {
    const { t } = useTranslation();
    
    return (
        <>
            <button
                className="flex items-center mb-4 text-sm font-medium cursor-pointer text-primary"
                onClick={onBack}
            >
                {`< ${t('profileWorkflow.back')}`}
            </button>
            
            <Title level="2" className="text-lg font-semibold text-center">{t("profileWorkflow.verificationTitle")}</Title>
            <div className="flex justify-center mt-1">
                <Check width={72} height={72} />
            </div>
            <div className="mt-4 text-center">
                <Paragraph>{t("profileWorkflow.verificationCode")}</Paragraph>
                <Paragraph className="text-2xl font-bold text-primary">CODE$: {verificationCode}</Paragraph>
                <Paragraph className="w-3/4 mx-auto mt-4 text-base text-center">
                    {t("profileWorkflow.verificationInstructions")}
                </Paragraph>
                <a
                    href="https://ideascale.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-3/4 px-4 py-2 mt-4 text-white transition rounded-lg bg-primary"
                >
                    {t("profileWorkflow.goToIdeascale")}
                </a>
            </div>
        </>
    );
};

export default VerificationCard;