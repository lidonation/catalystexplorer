import QuickPitchCard from "./QuickPitchCard";
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import Title from "@/Components/atoms/Title";
import SecondaryLink from "@/Components/SecondaryLink";

interface QuickPitchListProps {
    quickPitches?: {
        featured: App.DataTransferObjects.ProposalData[];
        regular: App.DataTransferObjects.ProposalData[];
    };
    activeFundId?: string | null;
}
export default function QuickPitchList ({ quickPitches, activeFundId }: QuickPitchListProps) {
    const { t } = useLaravelReactI18n();
    if (!quickPitches) {
        return <div className="text-center text-gray-persist">No quickpitches available</div>;
    }

    const featuredArray = Array.isArray(quickPitches?.featured) ? quickPitches.featured : [];
    const regularArray = Array.isArray(quickPitches?.regular) ? quickPitches.regular : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Title level="2" className='mb-6'>{t('home.quickpitchTitle')}</Title>
                <SecondaryLink
                    href={`${useLocalizedRoute('proposals.index')}?${ParamsEnum.QUICK_PITCHES}=1${activeFundId ? `&${ParamsEnum.FUNDS}[]=${activeFundId}` : ''}`}
                    className="text-content font-medium hover:underline"
                    data-testid="see-more-quickpitches"
                >
                    {t('proposals.seeMoreQuickPitches')}
                </SecondaryLink>
            </div>

            {featuredArray.length > 0 && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {featuredArray.map((quickPitch) => (
                            <QuickPitchCard key={quickPitch.id} proposal={quickPitch} thumbnail={''} />
                        ))}
                    </div>
                </div>
            )}

            {regularArray.length > 0 && (
                <div className="space-y-4">
                    
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {regularArray.map((quickPitch) => (
                            <QuickPitchCard key={quickPitch.id} proposal={quickPitch} thumbnail={''} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
