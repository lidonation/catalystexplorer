import SearchBar from '@/Components/SearchBar';
import BlueEyeIcon from '@/Components/svgs/BlueEyeIcon';
import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import { useTranslation } from 'react-i18next';

const CatalystIntro = () => {
    const { t } = useTranslation();
    return (
        <div className="splash-wrapper sticky -top-56 bg-gradient-to-r from-background-home-gradient-color-1 to-background-home-gradient-color-2 md:rounded-tl-4xl z-50">
            <div
                className="flex w-full flex-col gap-8 pb-4 pt-16"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <section className="container flex flex-col items-center justify-center gap-3 md:px-56">
                    <BlueEyeIcon
                        className="text-eye-logo"
                        width={90}
                        height={50}
                    />
                    <div>
                        <p className="text-center text-3xl text-content-light">
                            {t('catalystIntro.title.normalText')}{' '}
                            <span className="text-content-highlight-intro">
                                {t('catalystIntro.title.highlightedText')}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-center text-content-light">
                            {t('catalystIntro.subtitle')}
                        </p>
                    </div>
                </section>

                <section className="container sticky top-8 w-full py-4 md:px-64">
                    <div className="">
                        <SearchBar autoFocus />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CatalystIntro;
