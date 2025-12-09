import QuickPitchCard from "./QuickPitchCard";
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import Title from "@/Components/atoms/Title";
import SecondaryLink from "@/Components/SecondaryLink";
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

export default function QuickPitchList({ quickPitches, activeFundId }: QuickPitchListProps) {
    const { t } = useLaravelReactI18n();

    const { proposals, featuredIndices } = useMemo(() => {
        if (!quickPitches) {
            return { proposals: [], featuredIndices: new Set<number>() };
        }

        let allProposals: App.DataTransferObjects.ProposalData[];
        if (Array.isArray(quickPitches)) {
            allProposals = quickPitches;
        } else {
            allProposals = [
                ...(quickPitches?.featured || []),
                ...(quickPitches?.regular || [])
            ];
        }

        if (allProposals.length === 0) {
            return { proposals: [], featuredIndices: new Set<number>() };
        }

        // Determine how many to feature based on total count
        let featuredCount = 0;
        if (allProposals.length > 6) {
            featuredCount = 3;
        } else if (allProposals.length > 4) {
            featuredCount = 2;
        } else if (allProposals.length > 3) {
            featuredCount = 1;
        }

        // Select random indices to feature (avoid gaps of exactly 2)
        const indices = new Set<number>();
        const maxAttempts = allProposals.length * 2; // Prevent infinite loop
        let attempts = 0;

        while (indices.size < featuredCount && attempts < maxAttempts) {
            const randomIndex = Math.floor(Math.random() * allProposals.length);

            // Check if this index creates an invalid spacing with existing featured indices
            // Reject if consecutive (distance 1) or if gap is exactly 2 (distance 3)
            const hasInvalidSpacing = Array.from(indices).some(existingIndex => {
                const distance = Math.abs(existingIndex - randomIndex);
                return distance === 1 || distance === 3;
            });

            if (!hasInvalidSpacing) {
                indices.add(randomIndex);
            }

            attempts++;
        }

        return {
            proposals: allProposals,
            featuredIndices: indices
        };
    }, [quickPitches]);

    if (proposals.length === 0) {
        return <div className="text-center text-gray-persist">{t('recordsNotFound.message')}</div>;
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                {proposals.map((proposal, index) => {
                    const isFeatured = featuredIndices.has(index);
                    return (
                        <QuickPitchCard
                            key={proposal.id}
                            proposal={proposal}
                            thumbnail={''}
                            type={isFeatured ? 'featured' : 'regular'}
                            feature={isFeatured}
                            aspectRatio={isFeatured ? 'aspect-[16/9]' : 'aspect-[16/9]'}
                        />
                    );
                })}
            </div>
        </div>
    );
}
