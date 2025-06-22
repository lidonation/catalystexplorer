import { ProposalComparisonProvider } from '@/Context/ProposalComparisonContext';
import ModalLayout from '@/Layouts/ModalLayout';
import ProposalsTable from './ProposalComparisonTable';

export default function ProposalComparison() {
    return (
        <ModalLayout name="proposal-comparison" zIndex='z-60'>
            <ProposalComparisonProvider>
                <ProposalsTable />
            </ProposalComparisonProvider>
        </ModalLayout>
    );
}
