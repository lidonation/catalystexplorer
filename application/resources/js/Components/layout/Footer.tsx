import catalystWhiteLogo from '@/assets/images/catalyst-explorer-all-white-logo.png';
import { useTranslation } from 'react-i18next';
import Paragraph from '@/Components/atoms/Paragraph'; // Added import for Paragraph component

export default function Footer() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-96 w-full flex-col justify-between gap-16 rounded-t-xl bg-linear-to-r from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-1-dark)] pt-16 pb-12">
            <section className="text-content-light container">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">{t('proposals.proposals')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>{t('proposals.allProposals')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('proposalReviews')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('monthlyReports')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('funds.funds')}</Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">
                            {t('ideascaleProfiles.ideascaleProfiles')}
                        </h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>{t('proposers')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('groups')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('communities')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('dReps')}</Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">{t('data')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>{t('numbers')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('ccv4Votes')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('catalystAPI')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('proposalCSVs')}</Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">{t('social')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>{t('twitter')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('linkedIn')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('facebook')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('github')}</Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">{t('legal')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>{t('terms')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('privacy')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('cookies')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph>{t('licenses')}</Paragraph>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
            <section className="container">
                <div className="flex justify-between border-t pt-8">
                    <div className="">
                        <img
                            className="h-8"
                            src={catalystWhiteLogo}
                            alt={t('app.appLogoAlt')}
                        />
                    </div>
                    <Paragraph className="text-base font-normal text-gray-300">
                        {t('copyright')}
                    </Paragraph>
                </div>
            </section>
        </div>
    );
}