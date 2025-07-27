import { CatalystWhiteLogo } from '@/Components/svgs/CatalystWhiteLogo.tsx';
import Paragraph from '@/Components/atoms/Paragraph';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from "laravel-react-i18n";

export default function Footer() {
    const { t } = useLaravelReactI18n();

    return (
        <div className="relative z-10 flex min-h-96 w-full flex-col justify-between gap-16 rounded-t-xl bg-linear-to-r from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-1-dark)] pt-16 pb-12">
            <section className="text-content-light container" data-testid="footer-links">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    <div className="title-gap-y flex min-w-24 flex-col" data-testid="footer-proposals-links">
                        <h5 className="title-6">{t('proposals.proposals')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('proposals.index')} data-testid="proposals-link">
                                        {t('proposals.allProposals')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('reviews.index')} data-testid="reviews-link">
                                        {t('proposalReviews')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('reports.index')} data-testid="reports-link">
                                        {t('monthlyReports')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('funds.index')} data-testid="funds-link">
                                        {t('funds.funds')}
                                    </a>
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col" data-testid="footer-communities-links">
                        <h5 className="title-6">
                            {t('ideascaleProfiles.ideascaleProfiles')}
                        </h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('ideascaleProfiles.index')} data-testid="ideascale-profiles-link">
                                        {t('ideascaleProfiles.ideascaleProfiles')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('groups.index')} data-testid="groups-link">
                                        {t('groups.groups')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('communities.index')} data-testid="communities-link">
                                        {t('communities.communities')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('dreps.index')} data-testid="dreps-link">
                                        {t('dReps')}
                                    </a>
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col" data-testid="footer-data-links">
                        <h5 className="title-6">{t('data')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('numbers.impact')} data-testid="impact-link">
                                        {t('impact')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('numbers.spending')} data-testid="spending-link">
                                        {t('spending')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('numbers.general')} data-testid="general-link">
                                        {t('general')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('ccv4.index')} data-testid="ccv4-link">
                                        {t('ccv4Votes')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('api.index')} data-testid="catalyst-api-link">
                                        {t('catalystAPI')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href={useLocalizedRoute('proposals.csvs')} data-testid="proposal-csvs-link">
                                        {t('proposalCSVs')}
                                    </a>
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col" data-testid="footer-social-links">
                        <h5 className="title-6">{t('social')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>
                                    <a href="https://x.com/LidoNation" data-testid="twitter-link">
                                        {t('twitter')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href="https://www.linkedin.com/company/lidonation/" data-testid="linkedin-link">
                                        {t('linkedIn')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href="https://www.facebook.com/lidonation" data-testid="facebook-link">
                                        {t('facebook')}
                                    </a>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <a href="https://github.com/lidonation/catalystexplorer" data-testid="github-link">
                                        {t('github')}
                                    </a>
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div className="title-gap-y flex min-w-24 flex-col" data-testid="footer-legal-links">
                        <h5 className="title-6">{t('legal')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph data-testid="terms-link">{t('terms')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph data-testid="privacy-link">{t('privacy')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph data-testid="cookies-link">{t('cookies')}</Paragraph>
                            </li>
                            <li>
                                <Paragraph data-testid="licence-link">{t('licenses')}</Paragraph>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
            <section className="container" data-testid="footer-copyright">
                <div className="flex justify-between border-t pt-8">
                    <div className="">
                        <CatalystWhiteLogo />
                    </div>
                    <Paragraph className="text-base font-normal text-gray-300">
                        {t('copyright')}
                    </Paragraph>
                </div>
            </section>
        </div>
    );
}
