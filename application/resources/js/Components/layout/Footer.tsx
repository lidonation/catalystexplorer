import catalystWhiteLogo from '@/assets/images/catalyst-explorer-all-white-logo.png';
import { useTranslation } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-96 w-full flex-col justify-between gap-16 rounded-t-xl bg-gradient-to-r from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-1-dark)] pb-12 pt-16">
            <section className="container text-content-light">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-5">
                            {t('footer.links.proposals')}
                        </h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('footer.links.allProposals')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.proposalReviews')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.monthlyReports')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.funds')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-5">{t('footer.links.people')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('footer.links.proposers')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.groups')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.communities')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.dReps')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-5">{t('footer.links.data')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('footer.links.numbers')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.ccv4Votes')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.catalystAPI')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.proposalCSVs')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-5">{t('footer.links.social')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('footer.links.twitter')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.linkedIn')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.facebook')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.github')}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col">
                        <h5 className="title-5">{t('footer.links.legal')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <p>{t('footer.links.terms')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.privacy')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.cookies')}</p>
                            </li>
                            <li>
                                <p>{t('footer.links.licenses')}</p>
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
                        {t('footer.links.copyright')}
                    </p>
                </div>
            </section>
        </div>
    );
}
