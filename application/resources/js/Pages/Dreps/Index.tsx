import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import CardanoIcon from '@/Components/svgs/CardanoIcon';
import ProjectCatalyst from '@/Components/svgs/ProjectCatalystIcon';
import DrepsBanner from '@/assets/images/dreps-banner.jpg';
import ProjectCatalystBackground from '@/assets/images/project-catalyst-banner.jpg';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import FaqSection from './Partials/FaqSection';

const Index = () => {
    const { t } = useLaravelReactI18n();
    return (
        <>
            <Head title="Dreps" />

            <div className="relative -mt-0">
                {/* Landing Section */}
                <div className="relative w-full overflow-visible">
                    <div
                        className="hidden w-full md:block"
                        style={{
                            backgroundImage: `url(${DrepsBanner})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'top center',
                            backgroundRepeat: 'no-repeat',
                            aspectRatio: '18/10',
                        }}
                    />

                    <div
                        className="block h-screen w-full md:hidden"
                        style={{
                            backgroundImage: `url(${DrepsBanner})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            height: '700px',
                        }}
                    />

                    <div className="absolute inset-0">
                        <div className="mx-auto flex h-full items-center px-6 md:px-6 lg:px-16">
                            <div className="max-w-2xl">
                                <Title
                                    level="1"
                                    className="text-dark-persist mb-4 text-5xl font-bold transition md:text-5xl"
                                >
                                    {t('dreps.landing.title')}
                                </Title>
                                <Paragraph className="text-dark mb-8">
                                    {t('dreps.landing.subtitle')}
                                </Paragraph>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <PrimaryLink
                                        href={useLocalizedRoute(
                                            'workflows.drepSignUp.index',
                                            {
                                                step: 1,
                                            },
                                        )}
                                        className="bg-secondary text-content-light rounded-md px-6 py-3 text-center"
                                    >
                                        {t('dreps.landing.signUp')}
                                    </PrimaryLink>
                                    <Link
                                        href={useLocalizedRoute('dreps.list')}
                                        className="border-secondary text-secondary rounded-md border-2 bg-transparent px-6 py-3 text-center transition"
                                    >
                                        {t('dreps.landing.findDrep')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex min-h-screen flex-col">
                    {/* What are DReps Section */}
                    <div className="bg-background-dark py-15">
                        <div className="mx-auto px-6 md:px-10 lg:px-16">
                            <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-12">
                                <div className="flex hidden justify-center md:col-span-4 md:flex">
                                    <div className="relative">
                                        <CardanoIcon />
                                    </div>
                                </div>

                                <div className="md:col-span-6">
                                    <Title
                                        level="2"
                                        className="mb-4 text-4xl font-bold md:text-5xl"
                                    >
                                        {t('dreps.landing.aDrep')}
                                    </Title>
                                    <Paragraph className="text-dark mb-4">
                                        {t('dreps.landing.drepDescription')}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Catalyst Section */}
                    <div
                        className="relative flex min-h-[700px] flex-col justify-between py-16 md:min-h-[600px]"
                        style={{
                            backgroundImage: `url(${ProjectCatalystBackground})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="flex flex-col items-center justify-center px-4 pt-6 text-center md:pt-1">
                            <div className="mb-4">
                                <ProjectCatalyst />
                            </div>
                            <Title
                                level="2"
                                className="text-dark-persist mx-auto mb-4 max-w-2xl text-5xl font-bold md:text-4xl"
                            >
                                {t('dreps.landing.projectCatalyst')}
                            </Title>
                            <Paragraph className="text-dark mx-auto max-w-2xl">
                                {t('dreps.landing.projectCatalystDescription')}
                            </Paragraph>
                        </div>

                        <div className="mt-10 pb-16">
                            <div className="container mx-auto px-6 md:px-8 lg:px-16">
                                <div className="w-full md:w-1/2 lg:w-5/12">
                                    <Title
                                        level="2"
                                        className="text-dark-persist mb-4 text-5xl font-bold md:text-4xl"
                                    >
                                        {t('dreps.landing.empower')}
                                    </Title>
                                    <Paragraph className="text-dark">
                                        {t('dreps.landing.empowerDescription')}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <FaqSection />

                    {/* Call to Action */}
                    <div className="bg-background-dark px-6 py-8 md:px-40 md:py-16">
                        <div className="mx-auto">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
                                <div className="mb-6 text-left md:mb-0 md:text-left">
                                    <Title
                                        level="2"
                                        className="text3xl font-bold md:text-2xl lg:text-3xl"
                                    >
                                        {t('dreps.landing.excite')}
                                    </Title>
                                    <Title
                                        level="2"
                                        className="text-3xl font-bold md:text-2xl lg:text-3xl"
                                    >
                                        {t('dreps.landing.answerExcite')}
                                    </Title>
                                </div>
                                <div className="w-full md:w-auto">
                                    <Button className="bg-primary hover:bg-primary-dark text-light-persist w-full rounded-md px-8 py-3 text-center">
                                        {t('dreps.landing.signUp')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;
