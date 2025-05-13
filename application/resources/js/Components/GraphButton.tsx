import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import GraphIcon from './svgs/GraphIcon';
import { useLocalizedRoute } from '@/utils/localizedRoute';

const GraphButton = () => {
    const { t } = useTranslation();

    const onProposals = usePage().component == 'Proposals/Index';
    
    return (
        <>
            {onProposals && (
                <Link
                    href={useLocalizedRoute('proposals.charts')}
                    className="bg-bg-dark flex items-center justify-center overflow-hidden rounded-xl px-4 py-3 shadow-lg mb-4 transition-all hover:bg-opacity-90"
                    preserveState={false}
                >
                    <div className="flex h-12 w-12 items-center justify-center">
                        <GraphIcon />
                    </div>
                </Link>
            )}
        </>
    );
};

export default GraphButton;