import { Link, usePage } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import GraphIcon from './svgs/GraphIcon';
import { useLocalizedRoute } from '@/utils/localizedRoute';

const GraphButton = () => {
    const { t } = useLaravelReactI18n();

    const onProposals = usePage().component == 'Proposals/Index';

    return (
        <>
            {onProposals && (
                <Link
                    href={useLocalizedRoute('charts.proposals')}
                    className="bg-bg-dark flex items-center justify-center overflow-hidden rounded-xl px-4 py-3 shadow-lg mb-4 transition-all hover:bg-opacity-90"
                    preserveState={false}
                    data-testid="proposals-charts-button"
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
