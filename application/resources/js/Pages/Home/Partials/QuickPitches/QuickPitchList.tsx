import QuickPitchCard from "./QuickPitchCard";
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import Title from "@/Components/atoms/Title";
import SecondaryLink from "@/Components/SecondaryLink";
import { categorizeQuickPitches, createMixedQuickPitchLayout, organizeQuickPitchRows } from '@/utils/proposalUtils';
import { useMemo } from 'react';

interface QuickPitchListProps {
    quickPitches?: 
        | App.DataTransferObjects.ProposalData[]
        | {
            featured: App.DataTransferObjects.ProposalData[];
            regular: App.DataTransferObjects.ProposalData[];
          };
    activeFundId?: string | null;
}
export default function QuickPitchList ({ quickPitches, activeFundId }: QuickPitchListProps) {
    const { t } = useLaravelReactI18n();
    
    const { featuredArray, regularArray, mixedLayoutRows } = useMemo(() => {
        if (!quickPitches) {
            return { featuredArray: [], regularArray: [], mixedLayoutRows: [] };
        }

        let featured: App.DataTransferObjects.ProposalData[];
        let regular: App.DataTransferObjects.ProposalData[];

        if (Array.isArray(quickPitches)) {
            const categorized = categorizeQuickPitches(quickPitches, 3);
            featured = categorized.featured;
            regular = categorized.regular;
        } else {
            featured = Array.isArray(quickPitches?.featured) ? quickPitches.featured : [];
            regular = Array.isArray(quickPitches?.regular) ? quickPitches.regular : [];
        }

        const mixedLayout = createMixedQuickPitchLayout(featured, regular);
        const rows = organizeQuickPitchRows(mixedLayout);

        return {
            featuredArray: featured,
            regularArray: regular,
            mixedLayoutRows: rows,
        };
    }, [quickPitches]);

    if (!quickPitches || (featuredArray.length === 0 && regularArray.length === 0)) {
        return <div className="text-center text-gray-persist">No quickpitches available</div>;
    }

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

            {mixedLayoutRows.length > 0 && (
                <div className="space-y-4">
                    {mixedLayoutRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                            {row.map((item, itemIndex) => (
                                <QuickPitchCard
                                    key={`${rowIndex}-${item.proposal.id}`}
                                    proposal={item.proposal}
                                    thumbnail={''}
                                    type={item.type}
                                    className={item.type === 'featured' ? 'col-span-1 md:col-span-2' : 'col-span-1'}
                                    aspectRatio={item.type === 'featured' ? 'aspect-[32/8]' : 'aspect-[16/8]'}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
