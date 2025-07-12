import Paragraph from '@/Components/atoms/Paragraph';
import BlueEyeIcon from '@/Components/svgs/BlueEyeIcon';
import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import { useTranslation } from 'react-i18next';
import GlobalSearch from './GlobalSearch';

const CatalystIntro = () => {
    const { t } = useTranslation();
    return (
        <div
            className="splash-wrapper from-background-home-gradient-color-1 to-background-home-gradient-color-2 sticky -top-64 z-10 bg-linear-to-r md:rounded-tl-4xl"
            data-testid="catalyst-intro"
        >
            <div
                className="flex w-full flex-col gap-8 pt-16 pb-4"
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
                        data-testid="catalyst-intro-icon"
                    />
                    <div>
                        <Paragraph className="text-content-light text-center text-3xl">
                            {t('catalystIntro.title.normalText')}{' '}
                            <span className="text-content-highlight-intro">
                                {t('catalystIntro.title.highlightedText')}
                            </span>
                        </Paragraph>
                    </div>
                    <div>
                        <Paragraph className="text-content-light text-center">
                            {t('catalystIntro.subtitle')}
                        </Paragraph>
                    </div>
                </section>

                <section className="sticky top-12 container w-full pt-10 md:px-10 xl:px-60">
                    <GlobalSearch />
                </section>
            </div>
        </div>
    );
};

export default CatalystIntro;
