import Paragraph from "@/Components/atoms/Paragraph";
import Title from "@/Components/atoms/Title";
import CardanoIcon from "@/Components/svgs/CardanoIcon";
import ProjectCatalyst from "@/Components/svgs/ProjectCatalystIcon";
import DrepsBanner from '@/assets/images/dreps-banner.jpg';
import ProjectCatalystBackground from '@/assets/images/project-catalyst-banner.jpg';
import { Head, Link } from "@inertiajs/react";
import FaqSection from "./Partials/FaqSection";
import { useTranslation } from "react-i18next";
import Button from "@/Components/atoms/Button";

const Index = () => {
    const { t } = useTranslation();
    return (
        <>
            <Head title="Dreps" />

            <div className="-mt-0 relative">
                {/* Landing Section */}
                <div className="relative w-full overflow-visible">
                    <div
                        className="hidden md:block w-full"
                        style={{
                            backgroundImage: `url(${DrepsBanner})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'top center',
                            backgroundRepeat: 'no-repeat',
                            aspectRatio: '18/10'
                        }}
                    />
                    
                    <div
                        className="block md:hidden w-full h-screen"
                        style={{
                            backgroundImage: `url(${DrepsBanner})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            height: '700px'
                        }}
                    />

                    <div className="absolute inset-0">
                        <div className=" mx-auto px-6 md:px-6 lg:px-16 h-full flex items-center">
                            <div className="max-w-2xl">
                                <Title level='1' className="text-5xl md:text-5xl font-bold mb-4 text-dark-persist transition">
                                    {t('dreps.landing.title')}
                                </Title>
                                <Paragraph className="text-dark mb-8">
                                    {t('dreps.landing.subtitle')}
                                </Paragraph>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button className="bg-secondary text-content-light px-6 py-3 rounded-md text-center">
                                        {t('dreps.landing.signUp')}
                                    </Button>
                                    <Link href={'dreps/list'} className="bg-transparent border-2 border-secondary text-secondary px-6 py-3 rounded-md transition text-center">
                                        {t('dreps.landing.findDrep')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col min-h-screen">
                    {/* What are DReps Section */}
                    <div className="py-15 bg-background-dark">
                        <div className="mx-auto px-6 md:px-10 lg:px-16">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-center">
                                <div className="hidden md:flex md:col-span-4 flex justify-center">
                                    <div className="relative">
                                        <CardanoIcon/>
                                    </div>
                                </div>
                                
                                <div className="md:col-span-6">
                                    <Title level='2' className="text-4xl md:text-5xl font-bold mb-4">{t('dreps.landing.aDrep')}</Title>
                                    <Paragraph className="text-dark mb-4">
                                        {t('dreps.landing.drepDescription')}
                                    </Paragraph>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project Catalyst Section */}
                    <div className="py-16 min-h-[700px] md:min-h-[600px] flex flex-col justify-between relative" 
                        style={{ 
                            backgroundImage: `url(${ProjectCatalystBackground})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="flex flex-col items-center justify-center text-center px-4 pt-6 md:pt-1">
                            <div className="mb-4">
                                <ProjectCatalyst/>
                            </div>
                            <Title level='2' className="text-5xl md:text-4xl font-bold mb-4 text-dark-persist max-w-2xl mx-auto">
                                {t('dreps.landing.projectCatalyst')}
                            </Title>
                            <Paragraph className="text-dark max-w-2xl mx-auto">
                                {t('dreps.landing.projectCatalystDescription')}
                            </Paragraph>
                        </div>
                        
                        <div className="mt-10 pb-16">
                            <div className="container mx-auto px-6 md:px-8 lg:px-16">
                                <div className="w-full md:w-1/2 lg:w-5/12">
                                    <Title level='2' className="text-5xl md:text-4xl font-bold mb-4 text-dark-persist">
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
                    <FaqSection/>

                    {/* Call to Action */}
                    <div className="py-8 md:py-16 px-6 md:px-40 bg-background-dark">
                        <div className="mx-auto">
                            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                                <div className="text-left md:text-left mb-6 md:mb-0">
                                    <Title level='2' className="text3xl md:text-2xl lg:text-3xl font-bold">
                                        {t('dreps.landing.excite')}
                                    </Title>
                                    <Title level='2' className="text-3xl md:text-2xl lg:text-3xl font-bold">
                                        {t('dreps.landing.answerExcite')}
                                    </Title>
                                </div>
                                <div className="w-full md:w-auto">
                                    <Button className="bg-primary hover:bg-primary-dark text-light-persist px-8 py-3 rounded-md text-center w-full">
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
