import Button from '@/Components/atoms/Button';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ManageProposalButtonProps {
    proposal: ProposalData;
}
const ManageProposalButton: React.FC<ManageProposalButtonProps> = ({
    proposal,
}) => {
    const { t } = useLaravelReactI18n();

    const localizedRoute = useLocalizedRoute('my.proposals.manage', {
        proposal: proposal?.id,
    });

    const handleClick = () => {
        router.visit(localizedRoute);
    };

    return (
        <Button onClick={handleClick} ariaLabel={t('proposals.manageProposal')}>
            <div className="bg-success hover:bg-success-light rounded-md px-4 py-2 text-white transition-colors">
                {t('proposals.manageProposal')}
            </div>
        </Button>
    );
};

export default ManageProposalButton;
