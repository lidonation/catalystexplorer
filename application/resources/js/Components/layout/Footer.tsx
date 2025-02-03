import catalystWhiteLogo from '@/assets/images/catalyst-explorer-all-white-logo.png';
import { useTranslation } from 'react-i18next';

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
                                <p>{t('proposals.allProposals')}</p>
                            </li>
                            <li>
                                <p>{t('proposalReviews')}</p>
                            </li>
                            <li>
                                <p>{t('monthlyReports')}</p>
                            </li>
                            <li>
                                <p>{t('funds.funds')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">
                            {t('ideascaleProfiles.ideascaleProfiles')}
                        </h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('proposers')}</p>
                            </li>
                            <li>
                                <p>{t('groups')}</p>
                            </li>
                            <li>
                                <p>{t('communities')}</p>
                            </li>
                            <li>
                                <p>{t('dReps')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">{t('data')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('numbers')}</p>
                            </li>
                            <li>
                                <p>{t('ccv4Votes')}</p>
                            </li>
                            <li>
                                <p>{t('catalystAPI')}</p>
                            </li>
                            <li>
                                <p>{t('proposalCSVs')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">{t('social')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('twitter')}</p>
                            </li>
                            <li>
                                <p>{t('linkedIn')}</p>
                            </li>
                            <li>
                                <p>{t('facebook')}</p>
                            </li>
                            <li>
                                <p>{t('github')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-6">{t('legal')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('terms')}</p>
                            </li>
                            <li>
                                <p>{t('privacy')}</p>
                            </li>
                            <li>
                                <p>{t('cookies')}</p>
                            </li>
                            <li>
                                <p>{t('licenses')}</p>
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
                    <p className="text-base font-normal text-gray-300">
                        {t('copyright')}
                    </p>
                </div>
            </section>
        </div>
    );
}
