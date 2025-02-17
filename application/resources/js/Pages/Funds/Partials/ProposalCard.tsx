import Title from '@/Components/atoms/Title';
import Divider from '@/Components/Divider';
import ProposalFundingPercentages from '@/Pages/Proposals/Partials/ProposalFundingPercentages';
import ProposalFundingStatus from '@/Pages/Proposals/Partials/ProposalFundingStatus';
import { PageProps } from '@/types';
import { useTranslation } from 'react-i18next';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalCardProps extends Record<string, unknown> {
    proposal: ProposalData;
}

export default function ProposalCar({
    proposal,
}: PageProps<ProposalCardProps>) {
    const { t } = useTranslation();

    const gradientColors: Record<string, unknown> = {
        complete:
            'from-[var(--success-gradient-color-1)] to-[var(--success-gradient-color-2)]',
        default:
            'from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]',
    };
    const headerBGColor =
        gradientColors[proposal.status] || gradientColors.default;

    return (
        <>
            <div className="border-content-light w-full overflow-hidden rounded-md border border-1 p-2 shadow-md">
                {/* Card Content */}
                <header
                    className={`text-content-light w-full rounded-xl bg-linear-to-tr ${headerBGColor} flex h-full shrink flex-col`}
                >
                    {/* Top Section */}
                    <div className="grow">
                        <div className={`min-h-20 p-2 px-4 leading-tight`}>
                            <a
                                href={proposal.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`hover:text-primary font-medium ${
                                    false ? 'mb-4 text-center' : ''
                                }`}
                            >
                                {proposal.title}
                            </a>
                        </div>
                    </div>
                </header>
                <section className="mt-3" aria-labelledby="funding-heading">
                    <div className="my-1 flex items-center gap-2">
                        <Title level="3" className="font-semibold">
                            {t('funding')}
                        </Title>
                        <ProposalFundingStatus
                            funding_status={proposal.funding_status}
                        />
                    </div>
                    <ProposalFundingPercentages proposal={proposal} />
                </section>
                <Divider />
                <div className="">people</div>
            </div>
        </>
    );
}
