import Paragraph from '@/Components/atoms/Paragraph';
import { CatalystWhiteLogo } from '@/Components/svgs/CatalystWhiteLogo.tsx';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { Config, useRoute } from 'ziggy-js';
import NavLinkItem from '../atoms/NavLinkItem';

export default function Footer() {
    const { t } = useLaravelReactI18n();
    const { locale, ziggy } = usePage().props as any;
    const route = useRoute(ziggy as Config);

    return (
        <div className="relative z-10 flex min-h-96 w-full flex-col justify-between gap-16 rounded-t-xl bg-linear-to-r from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-1-dark)] pt-16 pb-12">
            <section
                className="text-content-light container"
                data-testid="footer-links"
            >
                <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    <div
                        className="title-gap-y flex min-w-24 flex-col"
                        data-testid="footer-proposals-links"
                    >
                        <h5 className="title-6">{t('proposals.proposals')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'proposals.index',
                                        )}
                                        data-testid="proposals-link"
                                        title={t('proposals.allProposals')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'reviews.index',
                                        )}
                                        data-testid="reviews-link"
                                        title={t('proposalReviews')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'reports.index',
                                        )}
                                        data-testid="reports-link"
                                        title={t('monthlyReports')}
                                        active={false}
                                        disable={true}
                                        showDisableTag={false}
                                        disabledTextColor="text-gray-200"
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute('funds.index')}
                                        data-testid="funds-link"
                                        title={t('funds.funds')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div
                        className="title-gap-y flex min-w-24 flex-col"
                        data-testid="footer-communities-links"
                    >
                        <h5 className="title-6">
                            {t('ideascaleProfiles.ideascaleProfiles')}
                        </h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'ideascaleProfiles.index',
                                        )}
                                        data-testid="ideascale-profiles-link"
                                        title={t(
                                            'ideascaleProfiles.ideascaleProfiles',
                                        )}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute('groups.index')}
                                        data-testid="groups-link"
                                        title={t('groups.groups')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'communities.index',
                                        )}
                                        data-testid="communities-link"
                                        title={t('communities.communities')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute('dreps.index')}
                                        data-testid="dreps-link"
                                        title={t('dReps')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div
                        className="title-gap-y flex min-w-24 flex-col"
                        data-testid="footer-data-links"
                    >
                        <h5 className="title-6">{t('data')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'numbers.impact',
                                        )}
                                        data-testid="impact-link"
                                        title={t('impact')}
                                        active={false}
                                        disable={true}
                                        showDisableTag={false}
                                        className="text-gray-200"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'numbers.spending',
                                        )}
                                        data-testid="spending-link"
                                        title={t('spending')}
                                        active={false}
                                        disable={true}
                                        showDisableTag={false}
                                        className="text-gray-200"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'numbers.general',
                                        )}
                                        data-testid="general-link"
                                        title={t('general')}
                                        active={false}
                                        disable={true}
                                        showDisableTag={false}
                                        className="text-gray-200"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute('ccv4.index')}
                                        data-testid="ccv4-link"
                                        title={t('ccv4Votes')}
                                        active={false}
                                        disable={true}
                                        showDisableTag={false}
                                        className="text-gray-200"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={route('api.index')}
                                        data-testid="catalyst-api-link"
                                        title={t('catalystAPI')}
                                        active={false}
                                        disable={true}
                                        showDisableTag={false}
                                        className="text-gray-200"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href={useLocalizedRoute(
                                            'proposals.csvs',
                                        )}
                                        data-testid="proposal-csvs-link"
                                        title={t('proposalCSVs')}
                                        active={false}
                                        disable={true}
                                        showDisableTag={false}
                                        className="text-gray-200"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div
                        className="title-gap-y flex min-w-24 flex-col"
                        data-testid="footer-social-links"
                    >
                        <h5 className="title-6">{t('social')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href="https://x.com/LidoNation"
                                        data-testid="twitter-link"
                                        title={t('twitter')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href="https://www.linkedin.com/company/lidonation/"
                                        data-testid="linkedin-link"
                                        title={t('linkedIn')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href="https://www.facebook.com/lidonation"
                                        data-testid="facebook-link"
                                        title={t('facebook')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph>
                                    <NavLinkItem
                                        href="https://github.com/lidonation/catalystexplorer"
                                        data-testid="github-link"
                                        title={t('github')}
                                        active={true}
                                        disable={false}
                                        className="hover:!bg-transparent"
                                    ></NavLinkItem>
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                    <div
                        className="title-gap-y flex min-w-24 flex-col"
                        data-testid="footer-legal-links"
                    >
                        <h5 className="title-6">{t('legal')}</h5>
                        <ul className="menu-gap-y flex flex-col">
                            <li>
                                <Paragraph data-testid="terms-link">
                                    {t('terms')}
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph data-testid="privacy-link">
                                    {t('privacy')}
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph data-testid="cookies-link">
                                    {t('cookies')}
                                </Paragraph>
                            </li>
                            <li>
                                <Paragraph data-testid="licence-link">
                                    {t('licenses')}
                                </Paragraph>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
            <section className="container" data-testid="footer-copyright">
                <div className="flex flex-wrap items-center justify-center gap-4 border-t pt-8 lg:justify-between">
                    {' '}
                    <div className="">
                        <CatalystWhiteLogo />
                    </div>
                    <Paragraph className="text-base font-normal text-gray-300">
                        {`${new Date().getFullYear().toString()}  ${' '+t('copyright')}`}
                    </Paragraph>
                </div>
            </section>
        </div>
    );
}
