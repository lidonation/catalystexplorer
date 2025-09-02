import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ValueLabel from '@/Components/atoms/ValueLabel.tsx';
import KeyValue from '@/Components/atoms/KeyValue.tsx';

export default function SupportCxBanner() {
    const { t } = useLaravelReactI18n();

    return (
        <div
            className="grid w-full grid-cols-1 gap-10 rounded-md p-4 px-8 py-10 lg:grid-cols-5"
            style={{
                background: 'linear-gradient(90deg, #DDF3FF 0%, #92A9F2 100%)'
            }}
        >
            <div className="text-content-darker w-full flex flex-col gap-8 col-span-3 lg:border-r md: lg:pr-8">
                <div>
                    <Title level="2" className="mb-4 font-bold">
                        {t('activeFund.supportUsTitle')}
                    </Title>
                    <Paragraph size="lg">{t('activeFund.supportUsSubtitle')}</Paragraph>
                </div>

                <div>
                    <Title level="3" className="mb-4 font-bold">
                        {t('activeFund.supportUsProposalTitle')}
                    </Title>
                    <Paragraph size="lg">{t('activeFund.supportUsProposalSubtitle')}</Paragraph>
                </div>

                <div>
                    <PrimaryLink
                        className="text-center"
                        target='_blank'
                        href={useLocalizedRoute(
                            'proposals.proposal.details',
                            { slug: 'all-in-one-catalyst-notifications-ai-lists-portfolios-f14' }
                        )}
                    >
                        {t('activeFund.supportUsSeeProposal')}
                    </PrimaryLink>
                </div>
            </div>

            <div className="flex h-full w-full items-center justify-center col-span-2">
                <div className="grid h-fit w-full grid-cols-1 gap-2">
                    <div className='flex flex-col gap-4'>
                        <div>
                            <Title level="2">
                                Our Track Record
                            </Title>
                            <div className='flex flex-row flex-wrap gap-x-4 justify-start'>
                                <KeyValue className='flex flex-row-reverse flex-wrap items-center justify-between gap-2' valueKey='Devs Onboarded:' value={30} />
                                <KeyValue className='flex flex-row-reverse flex-wrap items-center justify-between gap-2' valueKey='Opensource Contrib.:' value={5} />
                                <KeyValue className='flex flex-row-reverse flex-wrap items-center justify-between gap-2' valueKey='Completed Projects:' value={16} />
                                <KeyValue className='flex flex-row-reverse flex-wrap items-center justify-between gap-2' valueKey='Serving Since Fund:' value={5} />
                                <KeyValue className='flex flex-row-reverse flex-nowrap items-center justify-between gap-2' valueKey='Catalyst Checkins Iss.:' value='~440' />
                                <KeyValue className='flex flex-row-reverse flex-nowrap items-center justify-between gap-2' valueKey='Cardano Over Coffee Hours:' value='~740' />
                                <KeyValue className='flex flex-row-reverse flex-nowrap items-center justify-between gap-2' valueKey='Free API Requests Served:' value='~1,400,000' />
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}
