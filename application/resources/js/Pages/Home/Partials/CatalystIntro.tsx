import Paragraph from '@/Components/atoms/Paragraph';
import BlueEyeIcon from '@/Components/svgs/BlueEyeIcon';
import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import GlobalSearch from './GlobalSearch';

const CatalystIntro = () => {
    const { t } = useLaravelReactI18n();
    return (
        <div
            className="splash-wrapper from-background-home-gradient-color-1 to-background-home-gradient-color-2 sticky -top-64 z-10 bg-linear-to-r md:rounded-tl-4xl rtl:rounded-tl-none rtl:rounded-tr-4xl"
            data-testid="catalyst-intro"
        >
            <div
                className="flex w-full flex-col gap-8"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <section className="container flex flex-col items-center justify-center gap-3 md:px-10 xl:px-56 mb-8">
                    <BlueEyeIcon
                        className="text-eye-logo my-8"
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

                {/*<section className='container'>*/}
                {/*    <GlobalSearch />*/}
                {/*</section>*/}
            </div>
        </div>
    );
};

export default CatalystIntro;
