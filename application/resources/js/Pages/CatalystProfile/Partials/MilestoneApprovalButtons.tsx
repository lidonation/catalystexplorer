import { useLaravelReactI18n } from 'laravel-react-i18n';
import MilestonePoasData = App.DataTransferObjects.MilestonePoasData;

interface MilestoneApprovalButtonsPageProps {
    poas: MilestonePoasData[];
}

const MilestoneApprovalButtons: React.FC<MilestoneApprovalButtonsPageProps> = ({
    poas,
}) => {
    const { t } = useLaravelReactI18n();

    // Filter POAs with current: true
    const filteredPoas = poas.filter((poas) => poas.current);

    // Calculate approval and not approved count
    const getApprovalCounts = (poas: MilestonePoasData[]) => {
        let approvedCount = 0;
        let notApprovedCount = 0;

        poas.forEach((poa) => {
            poa.reviews.forEach((review: any) => {
                if (review.current) {
                    if (review.content_approved) {
                        approvedCount++;
                    } else {
                        notApprovedCount++;
                    }
                }
            });
        });

        return { approvedCount, notApprovedCount };
    };

    const { approvedCount, notApprovedCount } = getApprovalCounts(filteredPoas);

    return (
        <div className="flex min-w-[64px] flex-col items-center space-y-2">
            <button className="bg-success-light text-success border-success flex rounded-lg border border-1 px-2 py-1 text-sm whitespace-nowrap">
                {approvedCount} {t('Approvals')}
            </button>
            <button className="bg-error-light text-error border-error flex rounded-lg border border-1 px-2 py-1 text-sm whitespace-nowrap">
                {notApprovedCount} {t('Refusals')}
            </button>
        </div>
    );
};

export default MilestoneApprovalButtons;
