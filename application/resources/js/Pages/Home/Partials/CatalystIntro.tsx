import BlueEyeIcon from '@/Components/svgs/BlueEyeIcon';
import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import { useTranslation } from 'react-i18next';
import GlobalSearch from './GlobalSearch';
import Paragraph from "@/Components/atoms/Paragraph";

const CatalystIntro = () => {
    const { t } = useTranslation();
    return (
        <div className="splash-wrapper sticky -top-64 z-10 bg-linear-to-r from-background-home-gradient-color-1 to-background-home-gradient-color-2 md:rounded-tl-4xl">
            <div
                className="flex w-full flex-col gap-8 pb-4 pt-16"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <section className="container flex flex-col items-center justify-center gap-3 md:px-10 xl:px-56">
                    <BlueEyeIcon
                        className="text-eye-logo"
                        width={90}
                        height={50}
                    />
                    <div>
                        <Paragraph className="text-center text-3xl text-content-light">
                            {t('catalystIntro.title.normalText')}{' '}
                            <span className="text-content-highlight-intro">
                                {t('catalystIntro.title.highlightedText')}
                            </span>
                        </Paragraph>
                    </div>
                    <div>
                        <Paragraph className="text-center text-content-light">
                            {t('catalystIntro.subtitle')}
                        </Paragraph>
                    </div>
                </section>

                <section className="container sticky top-8 w-full py-4 md:px-10 xl:px-60">
                    <div className="">
                        <GlobalSearch/>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CatalystIntro;
