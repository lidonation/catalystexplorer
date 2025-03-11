import React from 'react';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Button from '@/Components/atoms/Button';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ManageProposalButtonProps {
    proposal: ProposalData;
}
const ManageProposalButton: React.FC<ManageProposalButtonProps> = ({ proposal }) => {

    const { t } = useTranslation();

    const localizedRoute = useLocalizedRoute('my.proposals.manage', {
        proposal: proposal?.hash,
    });

    const handleClick = () => {
        router.visit(localizedRoute);
    };

    return (
        <Button onClick={handleClick} ariaLabel={t('proposals.manageProposal')}>
            <div className="bg-success hover:bg-success-light text-white px-4 py-2 rounded-md transition-colors">
                {t('proposals.manageProposal')}
            </div>
        </Button>
    );
};

export default ManageProposalButton;