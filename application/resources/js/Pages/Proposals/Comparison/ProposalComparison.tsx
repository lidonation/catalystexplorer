import { ProposalComparisonProvider } from '@/Context/ProposalComparisonContext';
import RoutedModalLayout from '@/Layouts/RoutedModalLayout.tsx';
import ProposalsTable from './ProposalComparisonTable';

export default function ProposalComparison() {
    return (
        <RoutedModalLayout name="proposal-comparison" zIndex='z-60'>
            <ProposalComparisonProvider>
                <ProposalsTable />
            </ProposalComparisonProvider>
        </RoutedModalLayout>
    );
}
