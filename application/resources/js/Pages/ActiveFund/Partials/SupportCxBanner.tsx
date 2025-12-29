import KeyValue from '@/Components/atoms/KeyValue.tsx';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function SupportCxBanner() {
    const { t } = useLaravelReactI18n();

    return (
        <div className="w-full px-4 sm:px-6 lg:px-7 py-6 sm:py-8 lg:py-10 bg-gradient-banner rounded-lg sm:rounded-[10px] flex flex-col justify-start items-start gap-8 sm:gap-10 lg:gap-11 overflow-hidden">
            <div className="self-stretch flex flex-col justify-start items-start gap-6 lg:gap-7">
                <div className="self-stretch flex flex-col justify-center items-center gap-2 sm:gap-2.5">
                    <Title level="2" className="mb-2 sm:mb-4 font-bold text-content-dark text-center">
                        {t('activeFund.supportUsTitle')}
                    </Title>
                    <Paragraph size="lg" className='text-gray-persist font-normal text-center px-2 sm:px-4'>
                        {t('activeFund.supportUsSubtitle')}
                    </Paragraph>
                </div>

                {/* Stats Grid Container */}
                <div className="self-stretch flex flex-col justify-center items-center gap-4 sm:gap-6 lg:gap-7">
                    {/* First Row - 4 items */}
                    <div className="w-full max-w-none sm:max-w-2xl lg:max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                        <div className="px-3 sm:px-3.5 py-4 sm:py-5 bg-card-light rounded-lg flex flex-col justify-center items-center gap-3 sm:gap-5 border border-content-light">
                            <KeyValue
                                className="items-center text-center"
                                valueKey="Devs Onboarded"
                                value={30}
                            />
                        </div>
                        <div className="px-3 sm:px-3.5 py-4 sm:py-5 bg-card-light rounded-lg flex flex-col justify-center items-center gap-3 sm:gap-5 border border-content-light">
                            <KeyValue
                                className="items-center text-center"
                                valueKey="Opensource Contrib."
                                value={5}
                            />
                        </div>
                        <div className="px-3 sm:px-3.5 py-4 sm:py-5 bg-card-light rounded-lg flex flex-col justify-center items-center gap-3 sm:gap-5 border border-content-light">
                            <KeyValue
                                className="items-center text-center"
                                valueKey="Completed Projects"
                                value={16}
                            />
                        </div>
                        <div className="px-3 sm:px-3.5 py-4 sm:py-5 bg-card-light rounded-lg flex flex-col justify-center items-center gap-3 sm:gap-5 border border-content-light">
                            <KeyValue
                                className="items-center text-center"
                                valueKey="Serving Since Fund"
                                value={5}
                            />
                        </div>
                    </div>

                    {/* Second Row - 4 items */}
                    <div className="w-full max-w-none sm:max-w-2xl lg:max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                        <div className="px-3 sm:px-3.5 py-4 sm:py-5 bg-card-light rounded-lg flex flex-col justify-center items-center gap-3 sm:gap-5 border border-content-light">
                            <KeyValue
                                className="items-center text-center"
                                valueKey="Catalyst Checkins Hrs"
                                value={440}
                            />
                        </div>
                        <div className="px-3 sm:px-3.5 py-4 sm:py-5 bg-card-light rounded-lg flex flex-col justify-center items-center gap-3 sm:gap-5 border border-content-light">
                            <KeyValue
                                className="items-center text-center"
                                valueKey="Cardano Over Coffee Hrs"
                                value={740}
                            />
                        </div>
                        <div className="px-3 sm:px-3.5 py-4 sm:py-5 bg-card-light rounded-lg flex flex-col justify-center items-center gap-3 sm:gap-5 border border-content-light">
                            <KeyValue
                                className="items-center text-center"
                                valueKey="Spreadsheet Wrangled"
                                value={13}
                            />
                        </div>
                        <div className="px-3 sm:px-3.5 py-4 sm:py-5 bg-card-light rounded-lg flex flex-col justify-center items-center gap-3 sm:gap-5 border border-content-light">
                            <KeyValue
                                className="items-center text-center"
                                valueKey="Free API Requests"
                                value="1.4M"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="self-stretch flex flex-col justify-center items-center gap-4 sm:gap-5">
                <div className="self-stretch flex flex-col justify-start items-center gap-2 sm:gap-2.5">
                    <Title level="3" className="mb-2 sm:mb-4 font-bold text-center px-2">
                        {t('activeFund.supportUsProposalTitle')}
                    </Title>
                    <Paragraph size="lg" className='w-full max-w-sm sm:max-w-lg lg:max-w-2xl text-center text-gray-persist px-4'>
                        {t('activeFund.supportUsFooterTitle')}
                    </Paragraph>
                </div>
                <div>
                    <PrimaryLink
                        className="text-center"
                        target="_blank"
                        href={useLocalizedRoute('proposals.proposal.details', {
                            slug: 'support-wwwcatalystexplorercom-by-lido-f15',
                        })}
                    >
                        {t('activeFund.supportUsSeeProposal')}
                    </PrimaryLink>
                </div>
            </div>
        </div>
    );
}
